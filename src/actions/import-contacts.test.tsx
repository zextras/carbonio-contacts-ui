/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { useActionImportContacts } from './import-contacts';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';

describe('useActionImportContacts', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionImportContacts);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'UploadOutline',
				label: 'Import csv file',
				id: 'import-contacts-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the address book is the Trash folder', () => {
			const addressBook = generateFolder({
				id: FOLDERS.TRASH,
				name: 'Trash',
				absFolderPath: '/Trash',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionImportContacts);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is directly inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: FOLDERS.TRASH,
				absFolderPath: '/Trash/trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionImportContacts);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book is nested inside the Trash folder', () => {
			const addressBook = generateFolder({
				l: '10203',
				absFolderPath: '/Trash/parent/nested trashed stuff',
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionImportContacts);
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
			const { result } = setupHook(useActionImportContacts);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
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
			const { result } = setupHook(useActionImportContacts);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book is not Trash or trashed and is not a link', () => {
			const addressBook = generateFolder({
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionImportContacts);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it.todo('should call open a file selection dialog');

		it.todo("shouldn't open a modal if he user doesn't select a file");

		it.todo('should open a modal if he user select a file');
	});
});
