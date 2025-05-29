/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';

import { UIAction } from '../../../../actions/types';
import { screen, setupHook } from '@test-setup';
import { buildContact } from '../../../../tests/model-builder';
import { registerGetItemHandler } from '../../../../tests/msw-handlers/get-item';
import { useContactExportAction } from '../use-contact-export-action';

describe('useActionExportContact', () => {
	it('should return an object with the specific data', () => {
		const contact = buildContact();
		const { result } = setupHook(useContactExportAction, { initialProps: [contact] });
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'DownloadOutline',
				label: 'Export vCard file',
				id: 'export-contact-action'
			})
		);
	});

	describe('onClick', () => {
		it('should call the Get Item API when action is executed', async () => {
			const contact = buildContact();

			const apiInterceptor = registerGetItemHandler();
			const { result } = setupHook(useContactExportAction, { initialProps: [contact] });

			const action = result.current;
			await act(async () => {
				action.onClick();
			});

			await expect(apiInterceptor).resolves.toEqual({ id: contact.id });
		});

		it('should display an error snackbar if the API returns an error', async () => {
			const contact = buildContact();

			registerGetItemHandler({ error: true });

			const { result } = setupHook(useContactExportAction, { initialProps: [contact] });
			const action = result.current;
			await act(async () => {
				action.onClick();
			});

			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should display a success snackbar if the API returns without errors', async () => {
			registerGetItemHandler({ response: 'something' });

			const contact = buildContact();
			const { result } = setupHook(useContactExportAction, { initialProps: [contact] });
			const action = result.current;

			await act(async () => {
				action.onClick();
			});

			expect(await screen.findByText('vCard file exported successfully')).toBeVisible();
		});
	});
});
