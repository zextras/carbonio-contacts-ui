/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { useActionMoveAddressBook } from './move-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { getFolder } from '../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS_DESCRIPTORS } from '../carbonio-ui-commons/test/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { getMocksContext } from '../carbonio-ui-commons/test/mocks/utils/mocks-context';
import {
	setupHook,
	screen,
	setupTest,
	makeListItemsVisible,
	within
} from '../carbonio-ui-commons/test/test-setup';
import { AddressBookMoveModal } from '../components/modals/address-book-move';
import { NAMESPACES } from '../constants/api';
import { TIMERS } from '../constants/tests';
import { FolderActionRequest, FolderActionResponse } from '../network/api/folder-action';
import { getFoldersArray } from '../tests/utils';

describe('useActionMoveAddressBook', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionMoveAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'MoveOutline',
				label: 'Move',
				id: 'move-address-book-action'
			})
		);
	});

	describe('canExecute', () => {
		test.each`
			folder
			${FOLDERS_DESCRIPTORS.contacts}
			${FOLDERS_DESCRIPTORS.autoContacts}
			${FOLDERS_DESCRIPTORS.trash}
		`(`should return false if $folder.desc address book is passed as parameter`, ({ folder }) => {
			const addressBook = generateFolder({
				id: folder.id,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeFalsy();
		});

		it('should return true if the address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeTruthy();
		});

		it('should return true if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeTruthy();
		});

		it('should return false if the address book is a linked one', () => {
			const name = faker.word.noun();
			const folderId = `${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				isLink: true,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeFalsy();
		});

		it('should return false if the user has no write permission for the address book', () => {
			const name = faker.word.noun();
			const folderId = `${faker.string.uuid()}:${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				perm: 'r',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeFalsy();
		});

		it('should return true if the address book is not a system one and the user has write permission', () => {
			const addressBook = generateFolder({
				perm: 'xw',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook })).toBeTruthy();
		});

		it('should return false if the parent address book is set and is the current one of the given address book', () => {
			populateFoldersStore();
			const currentParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const addressBook = generateFolder({
				l: currentParentAddressBook?.id,
				view: FOLDER_VIEW.contact
			});

			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(
				action.canExecute({ addressBook, newParentAddressBook: currentParentAddressBook })
			).toBeFalsy();
		});

		it('should return true if the parent address book is set and is different from the current one of the given address book', () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.USER_ROOT);
			const addressBook = generateFolder({
				l: FOLDERS.CONTACTS,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook, newParentAddressBook })).toBeTruthy();
		});

		it('should return false if the user has not write permission on the destination link', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});
			const newParentAddressBook = generateFolder({
				isLink: true,
				perm: 'r',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook, newParentAddressBook })).toBeFalsy();
		});

		it('should return true if the user has write permission on the destination link', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});
			const newParentAddressBook = generateFolder({
				isLink: true,
				perm: 'w',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			expect(action.canExecute({ addressBook, newParentAddressBook })).toBeTruthy();
		});
	});

	describe('Execute', () => {
		const mocksContext = getMocksContext();
		const primaryAccountEmail = mocksContext.identities.primary.identity.email;

		it('should call open a modal with a specific title if no parent address book is set', () => {
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			act(() => {
				action.execute({ addressBook });
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText(`Move ${addressBook.name}`)).toBeVisible();
		});

		it("shouldn't open a modal if the action cannot be executed even if no parent address book is set", () => {
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.id === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			act(() => {
				action.execute({ addressBook });
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByText(`Move ${addressBook.name}`)).not.toBeInTheDocument();
		});

		it("shouldn't open a modal if the parent address book is set and is not valid", () => {
			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.CONTACTS);
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			act(() => {
				action.execute({ addressBook, newParentAddressBook });
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByText(`Move ${addressBook.name}`)).not.toBeInTheDocument();
		});

		it('should call the FolderAction API to move the folder if the parent address book is set and is valid', async () => {
			const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest, never>('FolderAction');

			populateFoldersStore();
			const newParentAddressBook = getFolder(FOLDERS.USER_ROOT);
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook, newParentAddressBook });
			});

			await expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					action: expect.objectContaining({ op: 'move', id: addressBook.id, l: FOLDERS.USER_ROOT })
				})
			);
		});

		it('should call the FolderAction API with the proper parameters', async () => {
			populateFoldersStore();
			const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest, FolderActionResponse>(
				'FolderAction'
			);
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const newParentAddressBookId = FOLDERS.USER_ROOT;

			const { user, result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook });
			});
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			const moveButton = screen.getByRole('button', { name: 'Move' });
			makeListItemsVisible();
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(moveButton));
			await expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					action: expect.objectContaining({
						id: addressBook.id,
						l: newParentAddressBookId,
						op: 'move'
					})
				})
			);
		});

		it('should call the FolderAction API with the proper parameters if the parent address book is selected through the modal', async () => {
			populateFoldersStore();
			const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest, FolderActionResponse>(
				'FolderAction'
			);
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const newParentAddressBookId = FOLDERS.USER_ROOT;

			const { user, result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook });
			});
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			const moveButton = screen.getByRole('button', { name: 'Move' });
			makeListItemsVisible();
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(moveButton));
			await expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					action: expect.objectContaining({
						id: addressBook.id,
						l: newParentAddressBookId,
						op: 'move'
					})
				})
			);
		});

		it('should call the FolderAction API with the proper parameters if the parent address book is set as parameter', async () => {
			populateFoldersStore();
			const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest, FolderActionResponse>(
				'FolderAction'
			);
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const newParentAddressBook = getFolder(FOLDERS.USER_ROOT);

			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook, newParentAddressBook });
			});

			await expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					action: expect.objectContaining({
						id: addressBook.id,
						l: newParentAddressBook?.id,
						op: 'move'
					})
				})
			);
		});

		it('should display a success snackbar if the API returns success', async () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const newParentAddressBook = getFolder(FOLDERS.USER_ROOT);

			const response: FolderActionResponse = {
				action: {
					id: addressBook.id,
					op: 'move'
				},
				_jsns: NAMESPACES.mail
			};

			createSoapAPIInterceptor<FolderActionRequest, FolderActionResponse>('FolderAction', response);

			const { result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook, newParentAddressBook });
			});

			expect(screen.getByText('Address book moved successfully')).toBeVisible();
		});

		it('should close the modal if the API returns success', async () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}

			const response: FolderActionResponse = {
				action: {
					id: addressBook.id,
					op: 'move'
				},
				_jsns: NAMESPACES.mail
			};

			createSoapAPIInterceptor<FolderActionRequest, FolderActionResponse>('FolderAction', response);
			const { user, result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook });
			});
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			makeListItemsVisible();
			const moveButton = screen.getByRole('button', { name: 'Move' });
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(moveButton));
			expect(screen.queryByText(`Move ${addressBook.name}`)).not.toBeInTheDocument();
		});

		it('should display an error snackbar if the API returns error', async () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}

			const response: ErrorSoapBodyResponse = {
				Fault: {
					Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};

			createSoapAPIInterceptor<FolderActionRequest, ErrorSoapBodyResponse>(
				'FolderAction',
				response
			);
			const { user, result } = setupHook(useActionMoveAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute({ addressBook });
			});
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});
			makeListItemsVisible();
			const moveButton = screen.getByRole('button', { name: 'Move' });
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(moveButton));

			expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should not close the modal if the API returns error', async () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}

			const response: ErrorSoapBodyResponse = {
				Fault: {
					Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};

			createSoapAPIInterceptor<FolderActionRequest, ErrorSoapBodyResponse>(
				'FolderAction',
				response
			);
			const onClose = jest.fn();
			const { user } = setupTest(
				<AddressBookMoveModal addressBookId={addressBook.id} onMove={jest.fn()} onClose={onClose} />
			);
			makeListItemsVisible();
			const moveButton = screen.getByRole('button', { name: 'Move' });
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(moveButton));
			expect(onClose).not.toHaveBeenCalled();
		});
	});
});
