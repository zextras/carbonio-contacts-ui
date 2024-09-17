/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from 'react-dom/test-utils';

import { useActionAddSharedAddressBooks } from './add-shared-address-books';
import { UIAction } from './types';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { handleGetShareInfoRequest } from '../carbonio-ui-commons/test/mocks/network/msw/handle-get-share-info';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionAddSharedAddressBooks', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionAddSharedAddressBooks);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: expect.anything(),
				label: 'Add shares',
				id: 'shares-add-action'
			})
		);
	});

	it('should return an canExecute field which is a function that returns always true', () => {
		const { result } = setupHook(useActionAddSharedAddressBooks);
		const action = result.current;
		expect(action.canExecute()).toBeTruthy();
	});

	it('should return an execute field which opens a modal with a specific title', async () => {
		createSoapAPIInterceptor('GetShareInfo', handleGetShareInfoRequest);
		const { result } = setupHook(useActionAddSharedAddressBooks);
		const action = result.current;
		await act(async () => {
			action.execute();
		});

		await act(async () => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText('Find Contact Shares')).toBeVisible();
	});
});
