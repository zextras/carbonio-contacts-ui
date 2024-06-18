/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { act } from 'react-dom/test-utils';

import { useActionRemoveAddressBookLink } from './remove-address-book-link';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { FolderActionRequest } from '../network/api/folder-action';

describe('useActionRemoveAddressBookLink', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionRemoveAddressBookLink);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'CloseOutline',
				label: 'Remove from this list',
				id: 'remove-address-book-link-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the address book is not a linked one', () => {
			const addressBook = generateFolder({
				isLink: false,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book is a linked one', () => {
			const name = faker.word.noun();
			const folderId = `${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				isLink: true,
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it('should not call the folder action API if the action cannot be executed', async () => {
			const addressBook = generateFolder({
				isLink: false,
				view: FOLDER_VIEW.contact
			});

			const spy = jest.fn();
			createSoapAPIInterceptor<FolderActionRequest>('FolderAction').then(spy);

			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			await act(async () => {
				action.execute(addressBook);
			});

			expect(spy).not.toHaveBeenCalled();
		});

		it('should call the folder action API for the given folder', async () => {
			const addressBook = generateFolder({
				isLink: true,
				view: FOLDER_VIEW.contact
			});

			const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest>('FolderAction');

			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			await act(async () => {
				action.execute(addressBook);
			});

			const request = await apiInterceptor;

			expect(request).toEqual(
				expect.objectContaining({
					action: expect.objectContaining({
						id: addressBook.id,
						op: 'delete'
					})
				})
			);
		});

		it('should display a success snackbar if the API returns successful', async () => {
			const addressBook = generateFolder({
				isLink: true,
				view: FOLDER_VIEW.contact
			});

			createSoapAPIInterceptor<FolderActionRequest>('FolderAction');

			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			await act(async () => {
				action.execute(addressBook);
			});

			expect(await screen.findByText('Shared removed successfully')).toBeVisible();
		});

		it('should display a success snackbar if the API returns successful', async () => {
			const addressBook = generateFolder({
				isLink: true,
				view: FOLDER_VIEW.contact
			});

			const apiResponse: ErrorSoapBodyResponse = {
				Fault: {
					Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};

			createSoapAPIInterceptor<FolderActionRequest, ErrorSoapBodyResponse>(
				'FolderAction',
				apiResponse
			);

			const { result } = setupHook(useActionRemoveAddressBookLink);
			const action = result.current;
			await act(async () => {
				action.execute(addressBook);
			});

			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});
	});
});
