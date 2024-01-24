/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import 'jest-styled-components';
import { act, waitFor, within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { first, last } from 'lodash';
import { rest } from 'msw';

import EditContactGroupBoard from './edit-contact-group-board';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { setupTest, screen } from '../../carbonio-ui-commons/test/test-setup';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from '../../constants';
import { PALETTE, TESTID_SELECTORS } from '../../constants/tests';
import { client } from '../../network/client';

function spyUseBoardHooks(updateBoardFn?: jest.Mock, closeBoardFn?: jest.Mock): void {
	jest.spyOn(shell, 'useBoardHooks').mockReturnValue({
		updateBoard: updateBoardFn ?? jest.fn(),
		setCurrentBoard: jest.fn(),
		getBoardContext: jest.fn(),
		getBoard: jest.fn(),
		closeBoard: closeBoardFn ?? jest.fn()
	});
}

function spyUseBoard(contactGroupId?: string): void {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: contactGroupId,
		id: '',
		url: '',
		app: '',
		icon: '',
		title: ''
	});
}

beforeAll(() => {
	spyUseBoardHooks();
	spyUseBoard('id');
});

describe('Edit contact group board', () => {
	function getContactInput(): HTMLElement {
		return screen.getByRole('textbox', {
			name: `Type an address, click ‘+’ to add to the group`
		});
	}

	describe('Default visualization', () => {
		it('should show fields for group name and addresses list', () => {
			setupTest(<EditContactGroupBoard />);
			expect(screen.getByRole('textbox', { name: 'Group name*' })).toBeVisible();
			expect(screen.getByText('Addresses list')).toBeVisible();
			expect(getContactInput()).toBeVisible();
			expect(screen.getByText(`Type an address, click ‘+’ to add to the group`)).toHaveStyleRule(
				'color',
				PALETTE.secondary.regular
			);
		});

		it('should render discard and save buttons', () => {
			setupTest(<EditContactGroupBoard />);
			expect(screen.getByRole('button', { name: /DISCARD/i })).toBeVisible();
			expect(
				screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
			).toBeVisible();
		});

		it('should render the avatar icon, name and the number of addresses', () => {
			setupTest(<EditContactGroupBoard />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
			expect(screen.getByText('New Group')).toBeVisible();
			expect(screen.getByText('Addresses: 0')).toBeVisible();
		});

		it('should render New Group string by default in the name input', () => {
			setupTest(<EditContactGroupBoard />);
			expect(screen.getByRole('textbox', { name: 'Group name*' })).toHaveValue('New Group');
		});
	});

	describe('Save button behaviours', () => {
		describe('Save button disabled', () => {
			it('should disable the save button when name input is empty string', async () => {
				const { user } = setupTest(<EditContactGroupBoard />);
				await user.clear(screen.getByRole('textbox', { name: 'Group name*' }));
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input contains only space characters', async () => {
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.type(nameInput, '   ');
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input length is greater than 256', async () => {
				const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.type(nameInput, newName);
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});
		});

		it.skip('should close the board when save button is clicked and the request is done successfully', async () => {
			const closeBoard = jest.fn();
			spyUseBoardHooks(undefined, closeBoard);
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								CreateContactResponse: {}
							}
						})
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			await waitFor(() => expect(closeBoard).toHaveBeenCalledTimes(1));
		});

		it.skip('should show success snackbar when save button is clicked and the request is done successfully', async () => {
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								CreateContactResponse: {}
							}
						})
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			expect(await screen.findByText('Contact group successfully created')).toBeVisible();
		});

		it.skip('should show error snackbar when create contact fails', async () => {
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.status(500),
						ctx.json({
							Body: {
								Fault: {
									Reason: { Text: 'invalid request: contact must have fields' },
									Detail: {
										Error: {
											Code: 'service.INVALID_REQUEST'
										}
									}
								}
							}
						})
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it.skip('should not close the board when create contact fails', async () => {
			const closeBoard = jest.fn();
			spyUseBoardHooks(undefined, closeBoard);
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.status(500),
						ctx.json({
							Body: {
								Fault: {
									Reason: { Text: 'invalid request: contact must have fields' },
									Detail: {
										Error: {
											Code: 'service.INVALID_REQUEST'
										}
									}
								}
							}
						})
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			await screen.findByText('Something went wrong, please try again');
			expect(closeBoard).not.toHaveBeenCalled();
		});

		it.skip('should not reset the fields when create contact fails', async () => {
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.status(500),
						ctx.json({
							Body: {
								Fault: {
									Reason: { Text: 'invalid request: contact must have fields' },
									Detail: {
										Error: {
											Code: 'service.INVALID_REQUEST'
										}
									}
								}
							}
						})
					)
				)
			);
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			await user.type(contactInput, newEmail1);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			await user.type(contactInput, newEmail2);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			await screen.findByText('Something went wrong, please try again');
			expect(screen.getByText(newName)).toBeVisible();
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			expect(within(memberList).getByText(newEmail1)).toBeVisible();
			const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
			expect(within(chipInput).getByText(newEmail2)).toBeVisible();
		});

		it.skip('should not use unconfirmed mails (valid chips in contactInput) in createContact request', async () => {
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								CreateContactResponse: {}
							}
						})
					)
				)
			);

			const createContactGroupSpy = jest.spyOn(client, 'createContactGroup');
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();

			await user.type(contactInput, newEmail1);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);

			await user.type(contactInput, newEmail2);
			await act(async () => {
				await user.type(contactInput, ',');
			});

			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await act(async () => {
				await user.click(saveButton);
			});
			await screen.findByText('Contact group successfully created');

			expect(createContactGroupSpy).toHaveBeenCalledWith('New Group', [newEmail1]);
		});

		it.skip('should use inserted name in createContact request', async () => {
			getSetupServer().use(
				rest.post('/service/soap/CreateContactRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								CreateContactResponse: {}
							}
						})
					)
				)
			);
			const newName = faker.string.alpha(10);
			const createContactGroupSpy = jest.spyOn(client, 'createContactGroup');
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);

			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await act(async () => {
				await user.click(saveButton);
			});
			await screen.findByText('Contact group successfully created');

			expect(createContactGroupSpy).toBeCalledWith(newName, []);
		});
	});

	describe('Discard button', () => {
		it('should reset to the initial name when click on the discard button', async () => {
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			expect(nameInput).toHaveValue(newName);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(nameInput).toHaveValue('New Group');
		});

		it('should delete chips when click on the discard button', async () => {
			const newEmail = faker.internet.email();
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();
			await user.type(contactInput, newEmail);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await act(async () => {
				await user.click(screen.getByRole('button', { name: /discard/i }));
			});
			expect(screen.queryByTestId(TESTID_SELECTORS.contactInputChip)).not.toBeInTheDocument();
		});

		it('should delete member list when click on the discard button', async () => {
			const newEmail = faker.internet.email();
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();
			await user.type(contactInput, newEmail);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			expect(within(memberList).queryByText(newEmail)).not.toBeInTheDocument();
		});

		it('should reset board title', async () => {
			const updateBoard = jest.fn();
			spyUseBoardHooks(updateBoard);
			const { user } = setupTest(<EditContactGroupBoard />);

			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(updateBoard).toBeCalledTimes(2);
			expect(updateBoard).toHaveBeenLastCalledWith({ title: 'New Group' });
		});
	});

	describe('Name', () => {
		it('should update name text', async () => {
			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			expect(screen.getByText(newName)).toBeVisible();
		});

		it('should update board title', async () => {
			const updateBoard = jest.fn();
			spyUseBoardHooks(updateBoard);
			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);

			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			expect(updateBoard).toHaveBeenLastCalledWith({ title: newName });
		});

		describe('Error message', () => {
			it('should show the error message in red when the name input length is 0', async () => {
				const errorMessage = 'Group name is required, enter a name to proceed';
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});

			it('should show the error message when the name input contains only space characters', async () => {
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.type(nameInput, '   ');
				expect(screen.getByText('Group name is required, enter a name to proceed')).toBeVisible();
			});

			it('should show the error message in red when the name input length is greater than 256', async () => {
				const errorMessage = 'Maximum length allowed is 256 characters';
				const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.type(nameInput, newName);
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});
		});
	});

	describe('Addresses list', () => {
		it('should update the number of the addresses when the user adds members on the list', async () => {
			const email = faker.internet.email();
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();
			await user.type(contactInput, email);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			await screen.findByTestId(TESTID_SELECTORS.membersList);
			expect(screen.getByText('Addresses: 1')).toBeVisible();
		});

		describe('Plus button and contact input', () => {
			it('should enable the plus button when at least a valid chip is in the contact input', async () => {
				const newEmail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});

			it('should enable the plus button when both valid and invalid chips are in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});

			it('should disable the plus button when there are no chips in the contact input', async () => {
				setupTest(<EditContactGroupBoard />);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should disable the plus button when there are only invalid chips in the contact input', async () => {
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should disable the plus button when the user insert a duplicated chip only', async () => {
				const validMail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should enable the plus button when the user add a chip from the dropdown', async () => {
				const email = faker.internet.email();
				getSetupServer().use(
					rest.post('/service/soap/FullAutocompleteRequest', async (req, res, ctx) =>
						res(
							ctx.json({
								Body: {
									FullAutocompleteResponse: `<FullAutocompleteResponse xmlns="urn:zimbraMail"><match email="&lt;${email}>" first="${faker.person.firstName()}" /></FullAutocompleteResponse>`
								}
							})
						)
					)
				);

				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email.substring(0, 3));
				act(() => {
					// run timers of dropdown
					jest.runOnlyPendingTimers();
				});
				await screen.findByTestId(TESTID_SELECTORS.dropdownList);

				const dropdownOption = await screen.findByText(email);
				expect(dropdownOption).toBeVisible();
				await user.click(dropdownOption);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});
		});

		describe('Contact group add and remove members', () => {
			it('should render the valid email on the list', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				expect(within(memberList).getByText(email)).toBeVisible();
			});

			it('should add the valid email on the list and maintain also the previous list item', async () => {
				const email = faker.internet.email();
				const email2 = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				expect(within(memberList).getByText(email)).toBeVisible();

				await user.type(contactInput, email2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				expect(within(memberList).getByText(email2)).toBeVisible();
				expect(within(memberList).getByText(email)).toBeVisible();
			});

			it('should render the avatar and the remove button on the list', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				const avatar = within(memberList).getByTestId(TESTID_SELECTORS.avatar);
				expect(avatar).toBeVisible();
				expect(avatar).toHaveTextContent(`${first(email)}${last(email)}`.toUpperCase());
				expect(
					screen.getByRoleWithIcon('button', {
						name: /remove/i,
						icon: TESTID_SELECTORS.icons.trash
					})
				);
			});

			it('should remove the email from the list when click on the remove button', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await user.click(
					screen.getByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.trash,
						name: /remove/i
					})
				);
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				expect(within(memberList).queryByText(email)).not.toBeInTheDocument();
			});

			it('should remove valid chip from input when the user clicks on plus button', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByTestId(TESTID_SELECTORS.contactInputChip)).toBeVisible();
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(screen.queryByTestId(TESTID_SELECTORS.contactInputChip)).not.toBeInTheDocument();
			});

			it('should update contactInput chips and icon when item is removed from the bottom list', async () => {
				const errorMessage = 'Address already present';
				const validMail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
				expect(screen.getByText(errorMessage)).toBeVisible();
				await user.click(
					screen.getByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.trash,
						name: /remove/i
					})
				);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should move valid chip addresses in bottom list and maintain invalid ones in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();
				expect(within(chipInput).getByText(newEmail)).toBeVisible();
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(within(chipInput).queryByText(newEmail)).not.toBeInTheDocument();
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();

				expect(
					within(screen.getByTestId(TESTID_SELECTORS.membersList)).getByText(newEmail)
				).toBeVisible();
			});

			it('should move valid chip addresses in bottom list and maintain duplicated ones in the contact input', async () => {
				const email1 = faker.internet.email();
				const email2 = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
				expect(within(chipInput).queryByText(email1)).not.toBeInTheDocument();
				await user.type(contactInput, email2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, email1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(within(chipInput).queryByText(email2)).not.toBeInTheDocument();
				expect(within(chipInput).getByText(email1)).toBeVisible();

				expect(
					within(screen.getByTestId(TESTID_SELECTORS.membersList)).getByText(email1)
				).toBeVisible();
				expect(
					within(screen.getByTestId(TESTID_SELECTORS.membersList)).getByText(email2)
				).toBeVisible();
			});
		});

		describe('Error message contact input', () => {
			it('should render "Invalid address" error message when there is only an invalid email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid address';
				const validMail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid addresses" error message when there are only invalid emails (at least 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid addresses';
				const validMail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Address already present" error message when there is only a duplicated email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Address already present';
				const validMail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);

				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render AlertCircle error icon inside chip when the chip is a duplicated email and remove the icon error when duplicated item is removed from the bottom list', async () => {
				const validMail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(
					within(screen.getByTestId(TESTID_SELECTORS.contactInputChip)).getByTestId(
						TESTID_SELECTORS.icons.duplicatedMember
					)
				).toBeVisible();
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', {
							icon: TESTID_SELECTORS.icons.trash,
							name: /remove/i
						})
					);
				});
				const chip = screen.getByTestId(TESTID_SELECTORS.contactInputChip);
				expect(
					within(chip).queryByTestId(TESTID_SELECTORS.icons.duplicatedMember)
				).not.toBeInTheDocument();
			});

			it('should render "Addresses already present" error message when there are only duplicated emails (at least 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Addresses already present';
				const validMail1 = faker.internet.email();
				const validMail2 = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();

				await user.type(contactInput, validMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, validMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await user.type(contactInput, validMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, validMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid and already present addresses" error message when there are at least 1 error chip per type and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid and already present addresses';
				const validMail = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();

				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);

				await user.type(contactInput, faker.string.alpha(10));
				await act(async () => {
					await user.type(contactInput, ',');
				});

				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});
		});
	});
});
