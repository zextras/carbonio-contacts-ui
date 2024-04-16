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

import { getContactInput } from './common-contact-group-board.test';
import EditContactGroupBoard from './edit-contact-group-board';
import { setupTest, screen } from '../../carbonio-ui-commons/test/test-setup';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from '../../constants';
import { JEST_MOCKED_ERROR, PALETTE, TESTID_SELECTORS } from '../../constants/tests';
import { apiClient } from '../../network/client';
import { useContactGroupStore } from '../../store/contact-groups';
import { buildContactGroup } from '../../tests/model-builder';
import { registerModifyContactGroupHandler } from '../../tests/msw-handlers/modify-contact-group';
import { createCnItem, spyUseBoardHooks } from '../../tests/utils';

function spyUseBoard(contactGroupId?: string): void {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: { contactGroupId },
		id: '',
		url: '',
		app: '',
		icon: '',
		title: ''
	});
}

const contactGroup = buildContactGroup();
beforeEach(() => {
	spyUseBoardHooks();
	spyUseBoard(contactGroup.id);
	useContactGroupStore.getState().addContactGroups([contactGroup]);
});

describe('Edit contact group board', () => {
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

		it('should not close the board when save button is clicked and the request is done successfully', async () => {
			const handler = registerModifyContactGroupHandler();

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
			await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
			expect(screen.getByText(newName)).toBeVisible();
		});

		it('should show success snackbar when save button is clicked and the request is done successfully', async () => {
			registerModifyContactGroupHandler(
				createCnItem(contactGroup.title, undefined, contactGroup.id)
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
			expect(await screen.findByText('Group successfully updated')).toBeVisible();
		});

		it('should show error snackbar when modify contact fails', async () => {
			registerModifyContactGroupHandler(undefined, JEST_MOCKED_ERROR);
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
			expect(
				await screen.findByText('Something went wrong saving the edits, try again')
			).toBeVisible();
		});

		it('should not close the board when modify contact fails', async () => {
			const closeBoard = jest.fn();
			spyUseBoardHooks(undefined, closeBoard);
			registerModifyContactGroupHandler(undefined, JEST_MOCKED_ERROR);

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
			await screen.findByText('Something went wrong saving the edits, try again');
			expect(closeBoard).not.toHaveBeenCalled();
			expect(screen.getByText(newName)).toBeVisible();
		});

		it('should not reset the fields when modify contact fails', async () => {
			registerModifyContactGroupHandler(undefined, JEST_MOCKED_ERROR);
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
			await screen.findByText('Something went wrong saving the edits, try again');
			expect(screen.getByText(newName)).toBeVisible();
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			expect(within(memberList).getByText(newEmail1)).toBeVisible();
			const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
			expect(within(chipInput).getByText(newEmail2)).toBeVisible();
		});

		it('should not use unconfirmed mails (valid chips in contactInput) in modifyContactGroup request', async () => {
			registerModifyContactGroupHandler(
				createCnItem(contactGroup.title, undefined, contactGroup.id)
			);
			const modifyContactGroupSpy = jest.spyOn(apiClient, 'modifyContactGroup');
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
			await screen.findByText('Group successfully updated');

			expect(modifyContactGroupSpy).toHaveBeenCalledWith(
				expect.objectContaining({ addedMembers: [newEmail1] })
			);
		});

		it('should use inserted name in modifyContactGroup request', async () => {
			registerModifyContactGroupHandler(
				createCnItem(contactGroup.title, undefined, contactGroup.id)
			);
			const newName = faker.string.alpha(10);
			const modifyContactGroupSpy = jest.spyOn(apiClient, 'modifyContactGroup');
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
			await screen.findByText('Group successfully updated');

			expect(modifyContactGroupSpy).toBeCalledWith(expect.objectContaining({ name: newName }));
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
			expect(nameInput).toHaveValue(contactGroup.title);
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
