/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { useActionCreateAddressBook } from './create-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupHook, screen } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionCreateAddressBook', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionCreateAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'AddressBookOutline',
				label: 'New address book',
				id: 'create-address-book-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the parent address book is the Trash folder', () => {
			const addressBook = generateFolder({
				id: FOLDERS.TRASH,
				name: 'Trash',
				absFolderPath: '/Trash',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the parent address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the parent address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the parent address book is not inside the Trash folder', () => {
			const name = faker.word.noun();
			const addressBook = generateFolder({
				name,
				absFolderPath: `/parent/${name}`,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return false if the parent address book has no subfolder creation permission', () => {
			const name = faker.word.noun();
			const folderId = `${faker.string.uuid()}:${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				perm: 'r',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the parent address book has subfolder creation permission', () => {
			const name = faker.word.noun();
			const folderId = `${faker.string.uuid()}:${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				perm: 'rc',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the parent address book is not Trash or trashed', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the parent address book is not set', () => {
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			expect(action.canExecute()).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it('should call open a modal with a specific title', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText(/create new address book/i)).toBeVisible();
		});

		it("shouldn't open a modal if the action cannot be executed", () => {
			const addressBook = generateFolder({
				id: FOLDERS.TRASH,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionCreateAddressBook);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByText(/create new address book/i)).not.toBeInTheDocument();
		});
	});
});
