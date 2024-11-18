/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { useActionDeleteAddressBook } from './delete-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionDeleteAddressBooks', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionDeleteAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Trash2Outline',
				label: 'Delete address book permanently',
				id: 'delete-address-book-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return true if the address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return false if the address book is not inside the Trash folder', () => {
			const name = faker.word.noun();
			const addressBook = generateFolder({
				name,
				absFolderPath: `/parent/${name}`,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is a system one', () => {
			const addressBook = generateFolder({
				id: FOLDERS.CONTACTS,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the user has no delete permission for that folder', () => {
			const addressBook = generateFolder({
				perm: 'r',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});
	});

	it('should return an execute field which opens a modal with a specific title', () => {
		const addressBook = generateFolder({
			l: FOLDERS.TRASH,
			name: 'trashed',
			absFolderPath: '/Trash/trashed',
			view: FOLDER_VIEW.contact
		});
		populateFoldersStore({ customFolders: [addressBook] });

		const { result } = setupHook(useActionDeleteAddressBook);
		const action = result.current;
		act(() => {
			action.execute(addressBook);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText(`Delete ${addressBook.name}`)).toBeVisible();
	});

	it('should not open the modal if the action cannot be executed', () => {
		const addressBook = generateFolder({
			id: FOLDERS.CONTACTS,
			view: FOLDER_VIEW.contact
		});
		populateFoldersStore({ customFolders: [addressBook] });

		const { result } = setupHook(useActionDeleteAddressBook);
		const action = result.current;

		act(() => {
			action.execute(addressBook);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.queryByText(`Delete ${addressBook.name}`)).not.toBeInTheDocument();
	});
});
