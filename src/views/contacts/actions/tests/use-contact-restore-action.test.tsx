/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';

import { UIAction } from '../../../../actions/types';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook, screen } from '../../../../carbonio-ui-commons/test/test-setup';
import { FOLDERS_DESCRIPTORS, TIMERS } from '../../../../constants/tests';
import { buildContact } from '../../../../tests/model-builder';
import { useContactRestoreAction } from '../use-contact-restore-action';

describe('useRestoreSingleContact', () => {
	it('should return an object with the specific data', () => {
		const contact = buildContact({ parent: FOLDERS_DESCRIPTORS.trash.id });
		const { result } = setupHook(useContactRestoreAction, { initialProps: [contact] });
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'RestoreOutline',
				label: 'Restore',
				id: 'restore-action'
			})
		);
	});

	describe('onClick', () => {
		it('should open the restore modal with the contact first name and last name in title', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.TRASH });
			const expectedTitle = `Restore ${contact.firstName} ${contact.lastName}'s contact`;

			const { result } = setupHook(useContactRestoreAction, { initialProps: [contact] });
			const action = result.current;
			act(() => {
				action.onClick();
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText(expectedTitle)).toBeVisible();
		});
	});
});
