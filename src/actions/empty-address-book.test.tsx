/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from 'react-dom/test-utils';

import { useActionEmptyAddressBook } from './empty-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionEmptyAddressBook', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionEmptyAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'EmptyFolderOutline',
				label: 'Empty address book',
				id: 'empty-address-book-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the address book is the Trash folder', () => {
			const addressBook = generateFolder({
				id: FOLDERS.TRASH,
				name: 'Trash',
				absFolderPath: '/Trash',
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book is not inside the Trash folder', () => {
			const name = faker.word.noun();
			const addressBook = generateFolder({
				name,
				absFolderPath: `/parent/${name}`,
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return false if the address book is a linked one', () => {
			const name = faker.word.noun();
			const folderId = `${faker.string.uuid()}:${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				isLink: true,
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book contains no contacts', () => {
			const addressBook = generateFolder({
				n: 0,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book contains contacts', () => {
			const addressBook = generateFolder({
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionEmptyAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	it('should return an execute field which opens a modal with a specific title', () => {
		const addressBook = generateFolder({
			n: faker.number.int({ min: 1 }),
			view: FOLDER_VIEW.contact
		});

		const { result } = setupHook(useActionEmptyAddressBook);
		const action = result.current;
		act(() => {
			action.execute(addressBook);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText(`Empty ${addressBook.name}`)).toBeVisible();
	});

	it('should return an execute field which not opens a modal with a specific title if the action cannot be executed', () => {
		const addressBook = generateFolder({
			id: FOLDERS.TRASH,
			name: 'Trash',
			absFolderPath: '/Trash',
			n: faker.number.int({ min: 1 }),
			view: FOLDER_VIEW.contact
		});
		const { result } = setupHook(useActionEmptyAddressBook);
		const action = result.current;
		act(() => {
			action.execute(addressBook);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.queryByText(`Empty ${addressBook.name}`)).not.toBeInTheDocument();
	});
});
