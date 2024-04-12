/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from 'react-dom/test-utils';

import { useActionDeleteAddressBook } from './delete-address-book';
import { UIAction } from './types';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
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
				absFolderPath: '/Trash/trashed stuff'
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return true if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff'
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});

		it('should return false if the address book is not inside the Trash folder', () => {
			const name = faker.word.noun();
			const addressBook = generateFolder({
				name,
				absFolderPath: `/parent/${name}`
			});
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it.todo('should return false if the address book is a system one', () => {
			const { result } = setupHook(useActionDeleteAddressBook);
			const action = result.current;
			expect(action.canExecute()).toBeFalsy();
		});
	});

	it('should return an execute field which opens a modal with a specific title', () => {
		const { result } = setupHook(useActionDeleteAddressBook);
		const action = result.current;
		act(() => {
			action.execute();
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText('Delete')).toBeVisible();
	});
});
