/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from 'react-dom/test-utils';

import { useActionEditAddressBook } from './edit-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionEditAddressBook', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionEditAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Edit2Outline',
				label: 'Edit address book',
				id: 'edit-address-book-action'
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
			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEditAddressBook);
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
			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the address book is a system one', () => {
			const addressBook = generateFolder({
				id: FOLDERS.CONTACTS,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the address book is a linked one', () => {
			const name = faker.word.noun();
			const folderId = `${faker.string.uuid()}:${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				absFolderPath: '/Trash/trashed stuff of someone else',
				isLink: true,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	describe('execute', () => {
		it('should open a modal with a specific title', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});

			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText(`Edit ${addressBook.name}'s properties`)).toBeVisible();
		});

		it('should not open the modal if the action cannot be executed', () => {
			const addressBook = generateFolder({
				id: FOLDERS.TRASH,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEditAddressBook);
			const action = result.current;

			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByText(`Edit ${addressBook.name}'s properties`)).not.toBeInTheDocument();
		});
	});
});
