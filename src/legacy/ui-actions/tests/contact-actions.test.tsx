/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as shell from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../tests/model-builder';
import { useHoverActions } from '../../../views/contacts/actions/use-hover-actions';

describe('Contacts actions', () => {
	describe('document current behavior', () => {
		beforeAll(() => {
			const mailTo = { id: 'mail-to', label: 'action.send_msg', execute: jest.fn() };
			jest.spyOn(shell, 'getAction').mockReturnValue([mailTo, true]);
		});
		it('should return [mailTo, move, delete] hover actions in this order when contact not in trash', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.CONTACTS });

			const { result } = setupHook(useHoverActions, { initialProps: [contact] });

			const actions = result.current;

			expect(actions[0].id).toBe('mail-to');
			expect(actions[1].id).toBe('edit');
			expect(actions[2].id).toBe('move-contacts-action');
			expect(actions[3].id).toBe('trash-contacts-action');
		});

		it('should return [restore, deletePermanently] hover actions in this order when contact in trash', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.TRASH });

			const { result } = setupHook(useHoverActions, { initialProps: [contact] });

			const actions = result.current;

			expect(actions[0].id).toBe('restore-contacts-action');
			expect(actions[1].id).toBe('delete-contacts-action');
		});
	});
});
