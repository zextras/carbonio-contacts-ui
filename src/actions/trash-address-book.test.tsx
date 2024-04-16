/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from 'react-dom/test-utils';

import { useActionTrashAddressBook } from './trash-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionTrashAddressBooks', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionTrashAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Trash2Outline',
				label: 'Delete address book',
				id: 'trash-address-book-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionTrashAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionTrashAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book is not inside the Trash folder', () => {
			const name = faker.word.noun();
			const addressBook = generateFolder({
				name,
				absFolderPath: `/parent/${name}`,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionTrashAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return false if the address book is a system one', () => {
			const addressBook = generateFolder({
				id: FOLDERS.CONTACTS,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionTrashAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});
	});

	it('should return an execute field which opens a modal with a specific title', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});

		const { result } = setupHook(useActionTrashAddressBook);
		const action = result.current;
		act(() => {
			action.execute(addressBook);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText(`Delete ${addressBook.name}`)).toBeVisible();
	});
});
