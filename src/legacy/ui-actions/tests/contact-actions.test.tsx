/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../tests/model-builder';
import { useHoverActions } from '../contact-actions';

describe('Contacts actions', () => {
	describe('document current behavior', () => {
		it('should return [trash , mailTo] hover actions in this order when contact not in trash', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.CONTACTS });

			const { result } = setupHook(useHoverActions);

			const actions = result.current(contact);

			expect(actions[0].id).toBe('trash-contacts-action');
			expect(actions[1].id).toBe('move-contacts-action');
		});
	});
	it.todo('should return [send, tag, edit, move, delete] hover actions in this order');
});
