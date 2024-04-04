/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from 'react-dom/test-utils';

import { useActionAddSharedAddressbooks } from './add-shared-addressbooks';
import { UIAction } from './types';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionAddSharedAddressbooks', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionAddSharedAddressbooks);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: expect.anything(),
				label: 'Add shares',
				id: 'shares-add-action'
			})
		);
	});

	it('should return an canExecute field which is a function that returns always true', () => {
		const { result } = setupHook(useActionAddSharedAddressbooks);
		const action = result.current;
		expect(action.canExecute()).toBeTruthy();
	});

	it('should return an execute field which opens a modal with a specific title', () => {
		const { result } = setupHook(useActionAddSharedAddressbooks);
		const action = result.current;
		act(() => {
			action.execute();
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(screen.getByText('Find Contact Shares')).toBeVisible();
	});
});
