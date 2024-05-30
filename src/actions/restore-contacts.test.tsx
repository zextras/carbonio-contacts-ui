/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { useActionRestoreContacts } from './restore-contacts';
import { UIAction } from './types';
import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { getFolder, getFoldersArray } from '../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import {
	setupHook,
	screen,
	makeListItemsVisible,
	within
} from '../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../constants/api';
import { FOLDERS_DESCRIPTORS, TIMERS } from '../constants/tests';
import { Contact } from '../legacy/types/contact';
import { ContactActionRequest } from '../legacy/types/soap';
import { ContactActionResponse } from '../network/api/contact-action';
import { buildContact } from '../tests/model-builder';

describe('useActionRestoreContacts', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionRestoreContacts);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'RestoreOutline',
				label: 'Restore',
				id: 'restore-contact-action'
			})
		);
	});

	describe('canExecute', () => {
		test.each`
			folder
			${FOLDERS_DESCRIPTORS.contacts}
			${FOLDERS_DESCRIPTORS.autoContacts}
			${FOLDERS_DESCRIPTORS.userDefined}
			${FOLDERS_DESCRIPTORS.sharedContacts}
		`(`should return false if the contact is inside $folder.desc`, ({ folder }) => {
			const contacts = [buildContact({ parent: folder.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeFalsy();
		});

		it('should return true if the contact is inside the trash', () => {
			const contacts = [buildContact({ parent: FOLDERS_DESCRIPTORS.trash.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeTruthy();
		});

		it('should return true if the contact is nested inside the trash', () => {
			populateFoldersStore();
			const trashedFolder = getFoldersArray().find(
				(folder) =>
					folder.view === 'contact' &&
					folder.absFolderPath?.startsWith('/Trash') &&
					getFolderIdParts(folder.id).id === FOLDERS.TRASH
			);
			if (!trashedFolder) {
				throw new Error('Cannot find a trashed addressbook');
			}
			const contacts = [buildContact({ parent: trashedFolder.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeTruthy();
		});

		it('should return false if one of the contacts is not inside the trash', () => {
			const contacts = [buildContact({ parent: folder.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeFalsy();
		});

		it('should return false if all contacts already belong to the destination address book', () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const contacts = times(10, () => buildContact({ parent: newParentAddressBook?.id }));

			const { result } = setupHook(useActionMoveContacts);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook })).toBeFalsy();
		});

		it("should return true if at least one contact doesn't already belong to the destination address book", () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const contacts = times(10, () => buildContact({ parent: newParentAddressBook?.id }));
			contacts[4].parent = FOLDERS.AUTO_CONTACTS;

			const { result } = setupHook(useActionMoveContacts);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook })).toBeTruthy();
		});
	});

	describe('Execute', () => {
		describe('Execute without setting a destination address book', () => {
			it('should call open a modal with a specific title', () => {
				populateFoldersStore();
				const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
				const contacts = times(10, () => buildContact({ parent: newParentAddressBook?.id }));

				const { result } = setupHook(useActionMoveContacts);
				const action = result.current;
				act(() => {
					action.execute({ contacts });
				});

				act(() => {
					jest.advanceTimersByTime(TIMERS.modal.delayOpen);
				});

				expect(screen.getByText(`Move ${contacts.length} contacts`)).toBeVisible();
			});

			it("shouldn't open a modal if the action cannot be executed", () => {
				populateFoldersStore();
				const contacts: Array<Contact> = [];
				const { result } = setupHook(useActionMoveContacts);
				const action = result.current;
				act(() => {
					action.execute({ contacts });
				});

				act(() => {
					jest.advanceTimersByTime(TIMERS.modal.delayOpen);
				});

				expect(screen.queryByRole('button', { name: 'Move' })).not.toBeInTheDocument();
			});

			// FIXME try to understand why it is not clicking on the accordion item
			it.skip('should call the FolderAction API with the proper parameters', async () => {
				populateFoldersStore();
				const apiInterceptor = createSoapAPIInterceptor<ContactActionRequest, never>(
					'ContactAction'
				);
				const contact = buildContact({ parent: FOLDERS.AUTO_CONTACTS });
				const { user, result } = setupHook(useActionMoveContacts);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact] });
				});

				act(() => {
					jest.advanceTimersByTime(TIMERS.modal.delayOpen);
				});

				const moveButton = screen.getByRole('button', { name: 'Move' });
				makeListItemsVisible();
				const newParentListItem = within(screen.getByTestId('folder-accordion-item-7')).getByText(
					'Contacts'
				);
				await act(async () => user.click(newParentListItem));
				await act(async () => user.click(moveButton));

				await expect(apiInterceptor).resolves.toEqual(
					expect.objectContaining({
						action: expect.objectContaining({ op: 'move', id: contact.id, l: FOLDERS.USER_ROOT })
					})
				);
			});
		});

		describe('Execute with a given destination address book', () => {
			it('should call the FolderAction API with the proper parameters', async () => {
				populateFoldersStore();
				const newParentAddressBook = getFolder(FOLDERS.AUTO_CONTACTS);
				const apiInterceptor = createSoapAPIInterceptor<ContactActionRequest, never>(
					'ContactAction'
				);
				const contact = buildContact({ parent: FOLDERS.CONTACTS });
				const { result } = setupHook(useActionMoveContacts);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				await expect(apiInterceptor).resolves.toEqual(
					expect.objectContaining({
						action: expect.objectContaining({
							op: 'move',
							id: contact.id,
							l: FOLDERS.AUTO_CONTACTS
						})
					})
				);
			});

			it('should display a success snackbar if the API returns success', async () => {
				populateFoldersStore();
				const contact = buildContact();
				const newParentAddressBook = getFolder(FOLDERS.AUTO_CONTACTS);

				const response: ContactActionResponse = {
					action: {
						id: contact.id,
						op: 'move'
					},
					_jsns: NAMESPACES.mail
				};

				createSoapAPIInterceptor<ContactActionRequest, ContactActionResponse>(
					'ContactAction',
					response
				);

				const { result } = setupHook(useActionMoveContacts);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				expect(screen.getByText('Contact moved')).toBeVisible();
			});

			it('should display an error snackbar if the API returns error', async () => {
				populateFoldersStore();
				const contact = buildContact();
				const newParentAddressBook = getFolder(FOLDERS.AUTO_CONTACTS);

				const response: ErrorSoapBodyResponse = {
					Fault: {
						Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
						Reason: { Text: faker.word.sample() }
					}
				};

				createSoapAPIInterceptor<ContactActionRequest, ErrorSoapBodyResponse>(
					'ContactAction',
					response
				);

				const { result } = setupHook(useActionMoveContacts);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
		});
	});
});
