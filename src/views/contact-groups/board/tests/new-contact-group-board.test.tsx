/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { http, HttpResponse } from 'msw';
import { Mock } from 'vitest';

import { getSetupServer } from '@jest-setup';
import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from 'constants/index';
import { TESTID_SELECTORS } from 'constants/tests';
import { spyUseBoardHooks } from 'tests/utils';
import * as createContactGroup from 'views/contact-groups/api/create-contact-group';
import NewContactGroupBoard from 'views/contact-groups/board/new-contact-group-board';
import { CONTACT_GROUPS_PATH } from 'views/contact-groups/navigation';

function getContactInput(): HTMLElement {
	return screen.getByRole('textbox', {
		name: `Type an address`
	});
}

function spyUseBoard(navigateTo?: Mock): void {
	vi.spyOn(shell, 'useBoard').mockReturnValue({
		context: { navigateTo: navigateTo ?? vi.fn() },
		id: '',
		boardViewId: '',
		app: '',
		icon: '',
		title: ''
	});
}

beforeAll(() => {
	spyUseBoardHooks();
});

beforeEach(() => {
	spyUseBoard();
});

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
	...(await vi.importActual('react-router-dom')),
	useNavigate: (): Mock => mockedUseNavigate
}));

function setupNewContactGroupBoard(): ReturnType<typeof setupTest> {
	return setupTest(<NewContactGroupBoard />);
}
describe('New contact group board', () => {
	describe('Save button behaviours', () => {
		describe('Save button disabled', () => {
			it('should disable the save button when name input is empty string', async () => {
				const { user } = setupNewContactGroupBoard();
				await user.clear(screen.getByRole('textbox', { name: 'Group name*' }));
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input contains only space characters', async () => {
				const { user } = setupNewContactGroupBoard();
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.type(nameInput, '   ');
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should disable save button when name input length is greater than 256', async () => {
				const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
				const { user } = setupNewContactGroupBoard();
				const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
				await user.clear(nameInput);
				await user.pasteInto(nameInput, newName.substring(0, CONTACT_GROUP_NAME_MAX_LENGTH));
				await user.type(nameInput, newName[CONTACT_GROUP_NAME_MAX_LENGTH]);
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});
		});

		it('should close the board when save button is clicked and the request is done successfully', async () => {
			const closeBoard = vi.fn();
			spyUseBoardHooks(undefined, closeBoard);
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json({
						Body: {
							CreateContactResponse: { cn: [{ id: '', _attrs: {} }] }
						}
					})
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();
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

		it('should show success snackbar when save button is clicked and the request is done successfully', async () => {
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json({
						Body: {
							CreateContactResponse: { cn: [{ id: '', _attrs: {} }] }
						}
					})
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();
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

		it('should redirect to created contact group after having created it successfully', async () => {
			const folder = generateFolder({ id: '10' });
			const newContactId = '1000';
			populateFoldersStore({ customFolders: [folder] });
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json({
						Body: {
							CreateContactResponse: { cn: [{ id: newContactId, l: folder.id, _attrs: {} }] }
						}
					})
				)
			);

			const newName = faker.string.alpha(10);

			const { user } = setupTest(<NewContactGroupBoard />, {
				initialEntries: ['/contact-groups']
			});
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			const saveButton = screen.getByRoleWithIcon('button', {
				name: /SAVE/i,
				icon: TESTID_SELECTORS.icons.save
			});
			await user.click(saveButton);
			expect(await screen.findByText('Contact group successfully created')).toBeVisible();
			expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
			expect(mockedUseNavigate).toHaveBeenCalledWith(
				`/contacts/folder/${folder.id}/${CONTACT_GROUPS_PATH}/${newContactId}`
			);
		});

		it('should show error snackbar when create contact fails', async () => {
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json(
						{
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
						},
						{
							status: 500
						}
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();
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

		it('should not close the board when create contact fails', async () => {
			const closeBoard = vi.fn();
			spyUseBoardHooks(undefined, closeBoard);
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json(
						{
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
						},
						{
							status: 500
						}
					)
				)
			);

			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();
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

		it('should not reset the fields when create contact fails', async () => {
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json(
						{
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
						},
						{
							status: 500
						}
					)
				)
			);
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();
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
			await screen.findByText('Something went wrong, please try again');
			expect(screen.getByText(newName)).toBeVisible();
			expect(within(memberList).getByText(newEmail1)).toBeVisible();
			const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
			expect(within(chipInput).getByRole('textbox')).toHaveValue(newEmail2);
		});

		it('should not use unconfirmed mails in createContact request', async () => {
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json({
						Body: {
							CreateContactResponse: { cn: [{ id: '', _attrs: {} }] }
						}
					})
				)
			);

			const createContactGroupSpy = vi.spyOn(createContactGroup, 'createContactGroup');
			const newEmail1 = faker.internet.email();
			const newEmail2 = faker.internet.email();
			const { user } = setupNewContactGroupBoard();
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
			await screen.findByText('Contact group successfully created');

			expect(createContactGroupSpy).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'New Group', members: [newEmail1] })
			);
		});

		it('should use inserted name in createContact request', async () => {
			getSetupServer().use(
				http.post('/service/soap/CreateContactRequest', async () =>
					HttpResponse.json({
						Body: {
							CreateContactResponse: { cn: [{ id: '', _attrs: {} }] }
						}
					})
				)
			);
			const newName = faker.string.alpha(10);
			const createContactGroupSpy = vi.spyOn(createContactGroup, 'createContactGroup');
			const { user } = setupNewContactGroupBoard();
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

			expect(createContactGroupSpy).toBeCalledWith(
				expect.objectContaining({ title: newName, members: [] })
			);
		});
	});

	describe('Discard button', () => {
		it('should reset to the initial name when click on the discard button', async () => {
			const { user } = setupNewContactGroupBoard();
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
			await user.clear(nameInput);
			await user.pasteInto(nameInput, newName.substring(0, CONTACT_GROUP_NAME_MAX_LENGTH));
			await user.type(nameInput, newName[CONTACT_GROUP_NAME_MAX_LENGTH]);
			// await user.type(nameInput, newName);
			expect(nameInput).toHaveValue(newName);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(nameInput).toHaveValue('New Group');
		});

		it('should delete member list when click on the discard button', async () => {
			const newEmail = faker.internet.email();
			const { user } = setupNewContactGroupBoard();
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
			const { user } = setupNewContactGroupBoard();
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			expect(screen.getByText(newName)).toBeVisible();
		});

		it('should update board title', async () => {
			const updateBoard = vi.fn();
			spyUseBoardHooks(updateBoard);
			const newName = faker.string.alpha(10);
			const { user } = setupNewContactGroupBoard();

			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			expect(updateBoard).toHaveBeenLastCalledWith({ title: newName });
		});
	});

	describe('Addresses list', () => {
		it('should update the number of the addresses when the user adds members on the list', async () => {
			const email = faker.internet.email();
			const { user } = setupNewContactGroupBoard();
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
				const { user } = setupNewContactGroupBoard();
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
				const { user } = setupNewContactGroupBoard();
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
				const { user } = setupNewContactGroupBoard();
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
				const { user } = setupNewContactGroupBoard();
				const contactInput = getContactInput();

				await user.type(contactInput, invalidEmail);
				await act(async () => {
					await user.keyboard('{Enter}');
				});

				expect(await screen.findByText(errorMessage)).toBeVisible();
			});
		});
	});
});
