/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import 'jest-styled-components';
import { act, within } from '@testing-library/react';
import { first, last } from 'lodash';
import { rest } from 'msw';

import NewContactGroupBoard from './NewContactGroupBoard';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { screen, setup } from '../../../utils/testUtils';
import { CONTACT_GROUP_TITLE_MAX_LENGTH } from '../../constants';
import { ICON_REGEXP, PALETTE, SELECTORS } from '../../constants/tests';

describe('New contact group board', () => {
	it('should show fields for group title and addresses list', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('textbox', { name: 'Group title*' })).toBeVisible();
		expect(screen.getByText('Addresses list')).toBeVisible();
		expect(
			screen.getByRole('textbox', {
				name: /Insert an address to add a new element/i
			})
		).toBeVisible();
	});

	it('should render discard and save buttons', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('button', { name: /DISCARD/i })).toBeVisible();
		expect(
			screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
		).toBeVisible();
	});

	it('should render the avatar icon, title and the number of addresses', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByTestId(ICON_REGEXP.avatar)).toBeVisible();
		expect(screen.getByText('New Group')).toBeVisible();
		expect(screen.getByText('Addresses: 0')).toBeVisible();
	});

	it('should render New Group string by default in the title input', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('textbox', { name: 'Group title*' })).toHaveValue('New Group');
	});

	describe('Save button disabled', () => {
		it('should disable the save button when title input is empty string', async () => {
			const { user } = setup(<NewContactGroupBoard />);
			await user.clear(screen.getByRole('textbox', { name: 'Group title*' }));
			expect(
				screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
			).toBeDisabled();
		});

		it('should disable save button when title input contains only space characters', async () => {
			const { user } = setup(<NewContactGroupBoard />);
			const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
			await user.clear(titleInput);
			await user.type(titleInput, '   ');
			expect(
				screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
			).toBeDisabled();
		});

		it('should disable save button when title input length is greater than 256', async () => {
			const newTitle = faker.string.alphanumeric(CONTACT_GROUP_TITLE_MAX_LENGTH + 1);
			const { user } = setup(<NewContactGroupBoard />);
			const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
			await user.clear(titleInput);
			await user.type(titleInput, newTitle);
			expect(
				screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
			).toBeDisabled();
		});
	});

	it('should reset to the initial title when click on the discard button', async () => {
		const { user } = setup(<NewContactGroupBoard />);
		const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
		const newTitle = faker.string.alphanumeric(CONTACT_GROUP_TITLE_MAX_LENGTH + 1);
		await user.clear(titleInput);
		await user.type(titleInput, newTitle);
		expect(titleInput).toHaveValue(newTitle);
		await user.click(screen.getByRole('button', { name: /discard/i }));
		expect(titleInput).toHaveValue('New Group');
	});

	describe('Error message', () => {
		it('should show the error message in red when the title input length is 0', async () => {
			const errorMessage = 'Error: title length must be greater than 0';
			const { user } = setup(<NewContactGroupBoard />);
			const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
			await user.clear(titleInput);
			expect(screen.getByText(errorMessage)).toBeVisible();
			expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
		});

		it('should show the error message when the title input contains only space characters', async () => {
			const { user } = setup(<NewContactGroupBoard />);
			const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
			await user.clear(titleInput);
			await user.type(titleInput, '   ');
			expect(screen.getByText('Error: title length must be greater than 0')).toBeVisible();
		});

		it('should show the error message in red when the title input length is greater than 256', async () => {
			const errorMessage = 'Error: title length can have maximum 256 characters';
			const newTitle = faker.string.alphanumeric(CONTACT_GROUP_TITLE_MAX_LENGTH + 1);
			const { user } = setup(<NewContactGroupBoard />);
			const titleInput = screen.getByRole('textbox', { name: 'Group title*' });
			await user.clear(titleInput);
			await user.type(titleInput, newTitle);
			expect(screen.getByText(errorMessage)).toBeVisible();
			expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
		});
	});

	describe('Addresses list', () => {
		describe('Plus button', () => {
			it('should enable the plus button when at least a valid chip is in the contact input', async () => {
				const newEmail = faker.internet.email();
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, newEmail);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				expect(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus })).toBeEnabled();
			});

			it('should enable the plus button when both valid and invalid chips are in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, newEmail);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				await user.type(inputElement, invalidMail);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				expect(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus })).toBeEnabled();
			});

			it('should disable the plus button when there are no chips in the contact input', async () => {
				setup(<NewContactGroupBoard />);
				expect(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus })).toBeDisabled();
			});

			it('should disable the plus button when there are only invalid chips in the contact input', async () => {
				const invalidMail = faker.string.alpha(10);
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, invalidMail);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				expect(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus })).toBeDisabled();
			});

			it('should enable the plus button when the user add a chip from the dropdown', async () => {
				const email = faker.internet.email();
				getSetupServer().use(
					rest.post('/service/soap/AutoCompleteRequest', async (req, res, ctx) =>
						res(
							ctx.json({
								Body: {
									AutoCompleteResponse: {
										match: [
											{
												email: `<${email}>`,
												first: faker.person.firstName()
											}
										]
									}
								}
							})
						)
					)
				);

				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, email.substring(0, 3));
				act(() => {
					// run timers of dropdown
					jest.runOnlyPendingTimers();
				});
				await screen.findByTestId(SELECTORS.dropdownList);

				const dropdownOption = await screen.findByText(email);
				expect(dropdownOption).toBeVisible();
				await user.click(dropdownOption);
				expect(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus })).toBeEnabled();
			});

			// TODO fix when contact input will be fixed cause actually invalid mail in contact are not shown
			it.todo('should enable the plus button when the user add a chip from the dropdown');

			it('should remove valid chip from input when the user clicks on plus button', async () => {
				const email = faker.internet.email();
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, email);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				expect(screen.getByTestId('default-chip')).toBeVisible();
				await act(async () => {
					await user.click(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus }));
				});
				expect(screen.queryByTestId('default-chip')).not.toBeInTheDocument();
			});

			it('should remove valid chip and maintain invalid ones in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, newEmail);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				await user.type(inputElement, invalidMail1);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				await user.type(inputElement, invalidMail2);
				await act(async () => {
					await user.type(inputElement, ',');
				});

				const chipInput = screen.getByTestId('contact-group-contact-input');
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();
				expect(within(chipInput).getByText(newEmail)).toBeVisible();
				await act(async () => {
					await user.click(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus }));
				});
				expect(within(chipInput).queryByText(newEmail)).not.toBeInTheDocument();
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();
			});
		});
		describe('Contact group members list', () => {
			it('should render the valid email on the list', async () => {
				const email = faker.internet.email();
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, email);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				await user.click(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus }));
				const memberList = await screen.findByTestId('member-list');
				expect(within(memberList).getByText(email)).toBeVisible();
			});

			it('should render the avatar and the remove button on the list', async () => {
				const email = faker.internet.email();
				const { user } = setup(<NewContactGroupBoard />);
				const inputElement = screen.getByRole('textbox', {
					name: /Insert an address to add a new element/i
				});
				await user.type(inputElement, email);
				await act(async () => {
					await user.type(inputElement, ',');
				});
				await user.click(screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.plus }));
				const memberList = await screen.findByTestId('member-list');
				const avatar = within(memberList).getByTestId('avatar');
				expect(avatar).toBeVisible();
				expect(avatar).toHaveTextContent(`${first(email)}${last(email)}`.toUpperCase());
				expect(screen.getByRoleWithIcon('button', { name: /remove/i, icon: ICON_REGEXP.trash }));
			});
		});
	});
});

/**
 * The discard action will reset the group to its default state.
 * Every contact group will be created in the main address book
 * Only inline contacts will be allowed
 * Every contact group must have a name in order to be created.
 * There won’t be a  minimum limit on members of a contact group
 * There won’t be a maximum limit on members of a contact group
 * Every chips will show the email inserted by the user
 * Distribution lists are valid members of a contact group and are inserted as inline value as every other member
 * The add action will be enabled only when at least one valid chip is inserted inside the Contact Input
 * [TENTATIVE] [IRIS-4906] Duplicate emails should be handled with a specific chip (as per figma) and cannot be accepted as valid values
 * When clicking on the add button only valid emails will be added in the list below, the discarded one will still be available in the contact input
 * the add button is disabled when one or more errors are present and no valid entries are provided.  Errors can be of two types and the tooltip will explain all the possible cases
 * [TENTATIVE] [IRIS-4906] When a chip is invalid because it is a duplicate and the entry of the same chip is deleted from the list below it should update and be considered valid
 * Once save is clicked and the request is done successfully the board will be closed
 * Board will close only if the response of the creation is successful
 * If an error occurs during saving request, board is kept open and an error snackbar will appear (generic error for now)
 * when user clicks on save but some valid chips are in the contact input, these chips will not be part of the creation request (first iteration)
 * The placeholder of the contact input will show a message to inform the user “add” action is required to make chip values considered when saving
 * [IRIS-4908] when user clicks on save but some valid chips are in the contact input, a message will tell the user these chips will not be part of the creation request (second iteration - still need refinement)
 */
