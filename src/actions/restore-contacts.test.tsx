/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';
import { times } from 'lodash';

import { useActionRestoreContacts } from './restore-contacts';
import { UIAction } from './types';
import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook, screen } from '../carbonio-ui-commons/test/test-setup';
import { FOLDERS_DESCRIPTORS, TIMERS } from '../constants/tests';
import { Contact } from '../legacy/types/contact';
import { buildContact } from '../tests/model-builder';
import { getFoldersArray } from '../tests/utils';

describe('useActionRestoreContacts', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionRestoreContacts);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'RestoreOutline',
				label: 'Restore',
				id: 'restore-contacts-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return true if the contact is inside the trash', () => {
			const contacts = [buildContact({ parent: FOLDERS_DESCRIPTORS.trash.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeTruthy();
		});

		it('should return true if the contact is nested inside the trash', () => {
			populateFoldersStore();
			const trashedFolder = getFoldersArray().find(
				(folder) =>
					folder.absFolderPath?.startsWith('/Trash') &&
					getFolderIdParts(folder.id).id !== FOLDERS.TRASH
			);
			if (!trashedFolder) {
				throw new Error('Cannot find a trashed addressbook');
			}
			const contacts = [buildContact({ parent: trashedFolder.id })];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeTruthy();
		});

		it('should return false if one of the contacts is not inside the trash', () => {
			populateFoldersStore();
			const contacts = times(15, () => buildContact({ parent: FOLDERS.TRASH }));
			contacts[7].parent = FOLDERS.CONTACTS;
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			expect(action.canExecute({ contacts })).toBeFalsy();
		});
	});

	describe('Execute', () => {
		it('should call open a modal with a specific title', () => {
			populateFoldersStore();
			const contacts = times(10, () => buildContact({ parent: FOLDERS.TRASH }));

			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			act(() => {
				action.execute({ contacts });
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText(`Restore ${contacts.length} contacts`)).toBeVisible();
		});

		it("shouldn't open a modal if the action cannot be executed", () => {
			populateFoldersStore();
			const contacts: Array<Contact> = [];
			const { result } = setupHook(useActionRestoreContacts);
			const action = result.current;
			act(() => {
				action.execute({ contacts });
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByRole('button', { name: 'Restore' })).not.toBeInTheDocument();
		});
	});
});
