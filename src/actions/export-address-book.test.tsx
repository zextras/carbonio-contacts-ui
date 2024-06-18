/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { act } from 'react-dom/test-utils';

import { useActionExportAddressBook } from './export-address-book';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';

describe('useActionExportAddressBook', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionExportAddressBook);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'DownloadOutline',
				label: 'Export csv file',
				id: 'export-address-book-action'
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
			const { result } = setupHook(useActionExportAddressBook);
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
			const { result } = setupHook(useActionExportAddressBook);
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
			const { result } = setupHook(useActionExportAddressBook);
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
			const { result } = setupHook(useActionExportAddressBook);
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
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return false if the address book contains no contacts', () => {
			const addressBook = generateFolder({
				n: 0,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book contains contacts', () => {
			const addressBook = generateFolder({
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it('should call the ExportContacts API', async () => {
			const addressBook = generateFolder({
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});

			const apiInterceptor = createSoapAPIInterceptor('ExportContacts');

			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			await act(async () => {
				action.execute(addressBook);
			});

			await expect(apiInterceptor).resolves.toBeDefined();
		});

		it('should display an error snackbar if the API returns an error', async () => {
			const response: ErrorSoapBodyResponse = {
				Fault: {
					Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};

			const addressBook = generateFolder({
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});

			createSoapAPIInterceptor<never, ErrorSoapBodyResponse>('ExportContacts', response);

			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should not call the ExportContacts API if the action cannot be executed', () => {
			const addressBook = generateFolder({
				n: 0,
				view: FOLDER_VIEW.contact
			});

			const callFlag = jest.fn();
			createSoapAPIInterceptor('ExportContacts').then(() => callFlag());

			const { result } = setupHook(useActionExportAddressBook);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			expect(callFlag).not.toHaveBeenCalled();
		});
	});
});
