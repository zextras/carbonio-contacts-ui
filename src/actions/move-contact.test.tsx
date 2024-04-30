/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { useActionMoveContact } from './move-contact';
import { UIAction } from './types';
import { getFolder, getFoldersArray } from '../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { createAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook, screen } from '../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../constants/api';
import { FOLDERS_DESCRIPTORS } from '../constants/tests';
import { ContactActionRequest } from '../legacy/types/soap';
import { ContactActionResponse } from '../network/api/contact-action';
import { buildContact } from '../tests/model-builder';

describe('useActionMoveContact', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionMoveContact);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'MoveOutline',
				label: 'Move',
				id: 'move-contact-action'
			})
		);
	});

	describe('canExecute', () => {
		test.each`
			folder
			${FOLDERS_DESCRIPTORS.contacts}
			${FOLDERS_DESCRIPTORS.autoContacts}
			${FOLDERS_DESCRIPTORS.trash}
			${FOLDERS_DESCRIPTORS.userDefined}
		`(`should return true if the destination address book is $folder.desc`, ({ folder }) => {
			const contacts = [buildContact({ parent: 'unknown-12345' })];
			const { result } = setupHook(useActionMoveContact);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook: folder })).toBeTruthy();
		});

		it('should return true if the address book is a linked one', () => {
			populateFoldersStore();
			const linkedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.isLink
			);
			if (!linkedFolder) {
				return;
			}
			const contacts = [buildContact()];
			const { result } = setupHook(useActionMoveContact);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook: linkedFolder })).toBeTruthy();
		});

		it('should return false if all contacts already belong to the destination address book', () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const contacts = times(10, () => buildContact({ parent: newParentAddressBook?.id }));

			const { result } = setupHook(useActionMoveContact);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook })).toBeFalsy();
		});

		it("should return true if at least one contact doesn't already belong to the destination address book", () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const contacts = times(10, () => buildContact({ parent: newParentAddressBook?.id }));
			contacts[4].parent = FOLDERS.AUTO_CONTACTS;

			const { result } = setupHook(useActionMoveContact);
			const action = result.current;
			expect(action.canExecute({ contacts, newParentAddressBook })).toBeTruthy();
		});
	});

	describe('Execute', () => {
		describe('Execute without setting a destination address book', () => {
			it.todo('should call open a modal with a specific title');

			it.todo("shouldn't open a modal if the action cannot be executed");

			it.todo('should call the FolderAction API with the proper parameters');
		});

		describe.skip('Execute setting a destination address book', () => {
			it('should call the FolderAction API with the proper parameters', async () => {
				populateFoldersStore();
				const newParentAddressBook = getFolder(FOLDERS.USER_ROOT);
				const apiInterceptor = createAPIInterceptor<ContactActionRequest, never>('ContactAction');
				const contact = buildContact();
				const { result } = setupHook(useActionMoveContact);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				await expect(apiInterceptor).resolves.toEqual(
					expect.objectContaining({
						action: expect.objectContaining({ op: 'move', id: contact.id, l: FOLDERS.USER_ROOT })
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

				createAPIInterceptor<ContactActionRequest, ContactActionResponse>(
					'ContactAction',
					response
				);

				const { result } = setupHook(useActionMoveContact);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				expect(screen.getByText('Address book moved successfully')).toBeVisible();
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

				createAPIInterceptor<ContactActionRequest, ErrorSoapBodyResponse>(
					'ContactAction',
					response
				);

				const { result } = setupHook(useActionMoveContact);
				const action = result.current;
				await act(async () => {
					action.execute({ contacts: [contact], newParentAddressBook });
				});

				expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
			});
		});
	});
});
