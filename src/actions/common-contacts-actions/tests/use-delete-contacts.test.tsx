/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';

import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { DELETE_PERMANENTLY_ACTION_DESCRIPTOR, TIMERS } from '../../../constants/tests';
import { Contact } from '../../../legacy/types/contact';
import { buildContact } from '../../../tests/model-builder';
import { useDeleteContacts } from '../use-delete-contacts';

describe('Delete-contacts', () => {
	describe("Delete-contacts' actions", () => {
		it('should return delete permanently action with correct icon and label', () => {
			const contacts: Contact[] = [buildContact()];
			const { result } = setupHook(() => useDeleteContacts(contacts));
			expect(result.current).toEqual(
				expect.objectContaining({
					...DELETE_PERMANENTLY_ACTION_DESCRIPTOR
				})
			);
		});
	});
	describe('onClick', () => {
		it('should open the delete permanently modal', async () => {
			populateFoldersStore();
			const contacts: Contact[] = [buildContact({ parent: FOLDERS.TRASH })];
			const { result } = setupHook(() => useDeleteContacts(contacts));
			const action = result.current;
			act(() => {
				action.onClick();
			});
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});
			expect(screen.getByRole('button', { name: 'Delete Permanently' })).toBeVisible();
		});
	});
});
