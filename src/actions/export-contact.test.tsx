/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from 'react-dom/test-utils';

import { useActionExportContact } from './export-contact';
import { UIAction } from './types';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../tests/model-builder';
import { registerGetItemHandler } from '../tests/msw-handlers/get-item';

describe('useActionExportContact', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionExportContact);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'DownloadOutline',
				label: 'Export vCard file',
				id: 'export-contact-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if no contact is passed', () => {
			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			expect(action.canExecute()).toBeFalsy();
		});

		it('should return true', () => {
			const contact = buildContact();
			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			expect(action.canExecute(contact)).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it('should not call the Get Item API if the action cannot be executed', () => {
			const callFlag = jest.fn();
			registerGetItemHandler().then(() => callFlag());

			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			act(() => {
				action.execute();
			});

			expect(callFlag).not.toHaveBeenCalled();
		});

		it('should call the Get Item API', async () => {
			const contact = buildContact();

			const apiInterceptor = registerGetItemHandler();

			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			await act(async () => {
				action.execute(contact);
			});

			await expect(apiInterceptor).resolves.toEqual({ id: contact.id });
		});

		it('should display an error snackbar if the API returns an error', async () => {
			const contact = buildContact();

			registerGetItemHandler({ error: true });

			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			await act(async () => {
				action.execute(contact);
			});

			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should display a success snackbar if the API returns without errors', async () => {
			registerGetItemHandler({ response: 'something' });

			const { result } = setupHook(useActionExportContact);
			const action = result.current;
			const contact = buildContact();

			await act(async () => {
				action.execute(contact);
			});

			expect(await screen.findByText('vCard file exported successfully')).toBeVisible();
		});
	});
});
