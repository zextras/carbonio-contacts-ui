/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';

import { useActionDeleteContacts } from './delete-contacts';
import { UIAction } from './types';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';
import { Contact } from '../legacy/types/contact';
import { buildContact } from '../tests/model-builder';

describe("Delete-contacts' actions", () => {
	it('should return true if the object response is correctly initialized', () => {
		const { result } = setupHook(useActionDeleteContacts);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'DeletePermanentlyOutline',
				label: 'Delete contact permanently',
				id: 'delete-contacts-action'
			})
		);
	});
});

describe('canExecute actions', () => {
	it('should return true if canExecute has TRASH as parent', () => {
		populateFoldersStore();
		const cont: Contact[] = [buildContact({ parent: FOLDERS.TRASH })];
		const { result } = setupHook(useActionDeleteContacts);
		const action = result.current;
		expect(action.canExecute(cont)).toBeTruthy();
	});

	it("should return false if canExecute hasn't a correct parent as prop", () => {
		populateFoldersStore();
		const cont: Contact[] = [buildContact({ parent: FOLDERS.CONTACTS })];
		const { result } = setupHook(useActionDeleteContacts);
		const action = result.current;
		expect(action.canExecute(cont)).toBeFalsy();
	});
});

describe('execute actions', () => {
	it('should return true if it can open the modal', async () => {
		populateFoldersStore();
		const cont: Contact[] = [buildContact({ parent: FOLDERS.TRASH })];
		const { result } = setupHook(useActionDeleteContacts);
		const action = result.current;
		act(() => {
			action.execute(cont);
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(screen.getByRole('button', { name: 'Delete Permanently' })).toBeVisible();
	});

	it('returns true if the label has a correct value', async () => {
		populateFoldersStore();
		const { result } = setupHook(useActionDeleteContacts);
		const action = result.current;
		expect(action.label).toBe('Delete contact permanently');
	});
});
