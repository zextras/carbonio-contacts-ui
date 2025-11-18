/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, within } from '@testing-library/react';
import { useBoard } from '@zextras/carbonio-shell-ui';

import { setupTest, screen } from '@test-setup';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from 'constants/index';
import { TESTID_SELECTORS, VITEST_MOCKED_ERROR } from 'constants/tests';
import { addContactsToStore } from 'legacy/store/contacts';
import * as modifyContactGroup from 'network/api/modify-contact';
import { buildContactGroup } from 'tests/model-builder';
import { registerModifyContactGroupHandler } from 'tests/msw-handlers/modify-contact-group';
import { createSoapContactGroup, spyUseBoardHooks } from 'tests/utils';
import EditContactGroupBoard from 'views/contact-groups/board/edit-contact-group-board';

function getContactInput(): HTMLElement {
	return screen.getByRole('textbox', {
		name: `Type an address`
	});
}

function spyUseBoard(contactGroupId: string, folderId: string): void {
	vi.mocked(useBoard).mockReturnValue({
		context: { contactGroupId, folderId },
		id: '',
		boardViewId: '',
		app: '',
		icon: '',
		title: ''
	});
}

const contactGroup = buildContactGroup();
const setupStoreForTest = (): void => {
	addContactsToStore([contactGroup]);
};

beforeEach(() => {
	spyUseBoardHooks();
	spyUseBoard(contactGroup.id, '1');
	setupStoreForTest();
});

describe('Edit contact group board', () => {
	describe('Save button behaviours', () => {
		describe('Save button disabled', () => {
			it('should disable the save button when name input is empty string', async () => {
				const { user } = setupTest(<EditContactGroupBoard />);
				await act(() => user.clear(screen.getByRole('textbox', { name: 'Group name*' })));
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input contains only space characters', async () => {
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await act(() => user.clear(nameInput));
				await act(() => user.pasteInto(nameInput, '   '));
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input length is greater than 256', async () => {
				const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
				const { user } = setupTest(<EditContactGroupBoard />);
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await act(() => user.clear(nameInput));
				await act(() => user.pasteInto(nameInput, newName));
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
			await act(async () => {
				await user.click(saveButton);
			});
			await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
			expect(screen.getByText(newName)).toBeVisible();
		});

		it('should show success snackbar when save button is clicked and the request is done successfully', async () => {
			registerModifyContactGroupHandler(
				createSoapContactGroup(contactGroup.title, undefined, contactGroup.id)
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
			registerModifyContactGroupHandler(undefined, VITEST_MOCKED_ERROR);
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
			const closeBoard = vi.fn();
			spyUseBoardHooks(undefined, closeBoard);
			registerModifyContactGroupHandler(undefined, VITEST_MOCKED_ERROR);

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
			registerModifyContactGroupHandler(undefined, VITEST_MOCKED_ERROR);
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const newName = faker.string.alpha(10);
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			await user.type(contactInput, newEmail1);
			await act(async () => {
				await user.keyboard('{Enter}');
			});
			await within(memberList).findByText(newEmail1);
			await user.type(contactInput, newEmail2);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			await screen.findByText('Something went wrong saving the edits, try again');
			expect(screen.getByText(newName)).toBeVisible();
			expect(within(memberList).getByText(newEmail1)).toBeVisible();
			const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
			expect(within(chipInput).getByRole('textbox')).toHaveValue(newEmail2);
		});

		it('should not use unconfirmed mails (valid chips in contactInput) in modifyContactGroup request', async () => {
			registerModifyContactGroupHandler(
				createSoapContactGroup(contactGroup.title, undefined, contactGroup.id)
			);
			const modifyContactGroupSpy = vi.spyOn(modifyContactGroup, 'modifyContactGroup');
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const { user } = setupTest(<EditContactGroupBoard />);
			const contactInput = getContactInput();

			await user.type(contactInput, newEmail1);
			await act(async () => {
				await user.keyboard('{Enter}');
			});
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			await within(memberList).findByText(newEmail1);

			await user.type(contactInput, newEmail2);

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
				createSoapContactGroup(contactGroup.title, undefined, contactGroup.id)
			);
			const newName = faker.string.alpha(10);
			const modifyContactGroupSpy = vi.spyOn(modifyContactGroup, 'modifyContactGroup');
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
			await user.pasteInto(nameInput, newName.substring(0, CONTACT_GROUP_NAME_MAX_LENGTH));
			await user.type(
				nameInput,
				newName.substring(CONTACT_GROUP_NAME_MAX_LENGTH, CONTACT_GROUP_NAME_MAX_LENGTH + 1)
			);
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
				await user.keyboard('{Enter}');
			});
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			await within(memberList).findByText(newEmail);
			await user.click(screen.getByRole('button', { name: /discard/i }));
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
			const updateBoard = vi.fn();
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
				await user.keyboard('{Enter}');
			});
			const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
			await within(memberList).findByText(email);
			await screen.findByTestId(TESTID_SELECTORS.membersList);
			expect(screen.getByText('Addresses: 1')).toBeVisible();
		});

		describe('Contact group add and remove members', () => {
			it('should render the valid email on the list', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, '{Enter}');
				});
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				await waitFor(() => expect(within(memberList).getByText(email)).toBeEnabled());
			});

			it('should add the valid email on the list and maintain also the previous list item', async () => {
				const email = faker.internet.email();
				const email2 = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);

				await act(async () => {
					await user.keyboard('{Enter}');
				});
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				expect(await within(memberList).findByText(email)).toBeVisible();

				await user.type(contactInput, email2);
				await act(async () => {
					await user.keyboard('{Enter}');
				});
				expect(await within(memberList).findByText(email2)).toBeVisible();
				expect(within(memberList).getByText(email)).toBeVisible();
			});

			it('should remove the email from the list when click on the remove button', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.keyboard('{Enter}');
				});
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				await within(memberList).findByText(email);
				await user.click(
					screen.getByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.trash,
						name: /remove/i
					})
				);
				expect(within(memberList).queryByText(email)).not.toBeInTheDocument();
			});
		});

		describe('Error message contact input', () => {
			it('should render "Invalid address" error message when try to confirm invalid email', async () => {
				const errorMessage = 'Invalid address';
				const invalidEmail = 'test@';
				const { user } = setupTest(<EditContactGroupBoard />);
				const contactInput = getContactInput();

				await user.type(contactInput, invalidEmail);
				await act(async () => {
					await user.keyboard('{Enter}');
				});

				expect(await screen.findByText(errorMessage)).toBeVisible();
			});
		});
	});

	describe('shared account', () => {
		const contactGroupId = '123-456:1';
		const folderId = '123-456:10';
		it('should display contact group to edit', async () => {
			vi.mocked(useBoard).mockReturnValue({
				context: { contactGroupId, folderId },
				id: '',
				boardViewId: '',
				app: '',
				icon: '',
				title: ''
			});
			const sharedContactGroup = buildContactGroup({
				title: 'Contact Group in shared account',
				id: contactGroupId,
				parent: folderId
			});
			addContactsToStore([sharedContactGroup]);

			registerModifyContactGroupHandler(
				createSoapContactGroup(sharedContactGroup.title, undefined, sharedContactGroup.id)
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
	});
});
