/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isContacts, isEmailedContacts } from './folders';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';

describe('Folders helpers', () => {
	describe('isContacts', () => {
		test('If no folderId is specified false is returned', () => {
			const folderId = undefined;
			expect(
				isContacts(
					// Testing the case in which the parameter is undefined
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					folderId
				)
			).toBe(false);
		});

		test('A folder with a id = 7 is recognized as the Contacts folder', () => {
			const folderId = FOLDERS.CONTACTS;
			expect(isContacts(folderId)).toBe(true);
		});

		test('A folder with a id != 7 is not recognized as the Contacts folder', () => {
			const folderId = '99';
			expect(isContacts(folderId)).toBe(false);
		});

		test('A folder with a zid and an id = 7 is recognized as the Contacts folder', () => {
			const folderId = `somelonghash:${FOLDERS.CONTACTS}`;
			expect(isContacts(folderId)).toBe(true);
		});

		test('A folder with a zid and an id != 7 is not recognized as the Contacts folder', () => {
			const folderId = 'anotherlonghash:99';
			expect(isContacts(folderId)).toBe(false);
		});
	});

	describe('isEmailedContacts', () => {
		test('If no folderId is specified false is returned', () => {
			const folderId = undefined;
			expect(
				isEmailedContacts(
					// Testing the case in which the parameter is undefined
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					folderId
				)
			).toBe(false);
		});

		test('A folder with a id = 13 is recognized as the "Emailed Contacts" folder', () => {
			const folderId = FOLDERS.AUTO_CONTACTS;
			expect(isEmailedContacts(folderId)).toBe(true);
		});

		test('A folder with a id != 13 is not recognized as the "Emailed Contacts" folder', () => {
			const folderId = '99';
			expect(isEmailedContacts(folderId)).toBe(false);
		});

		test('A folder with a zid and an id = 13 is recognized as the "Emailed Contacts" folder', () => {
			const folderId = `somelonghash:${FOLDERS.AUTO_CONTACTS}`;
			expect(isEmailedContacts(folderId)).toBe(true);
		});

		test('A folder with a zid and an id != 13 is not recognized as the "Emailed Contacts" folder', () => {
			const folderId = 'anotherlonghash:99';
			expect(isEmailedContacts(folderId)).toBe(false);
		});
	});

	describe('getSortCriteria', () => {
		it.todo('should return "1000" if the given folder is "Contacts"');

		it.todo('should return "2000" if the given folder is "Emailed Contacts"');

		it.todo('should return "3000-A" if the given folder is named "A"');

		it.todo('should return "4000" if the given folder is "Trash"');

		it.todo('should return "5000-A" if the given folder is a link named "A"');
	});

	describe('getSortCriteria', () => {
		it.todo('should return the list of the folders in the alphabetical order recursively');
	});

	describe('getFolderIconName', () => {});

	describe('getFolderIconColor', () => {});
});
