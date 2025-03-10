/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../../tests/model-builder';
import { useContactPreviewActions } from '../use-contact-preview-actions';

describe('Contact Preview Actions', () => {
	it('should return [send, tag, edit, move, trash] actions in this order if not in trash folder', () => {
		populateFoldersStore();
		const folderId = FOLDERS.CONTACTS;
		const contact = buildContact({ parent: folderId });

		const { result } = setupHook(useContactPreviewActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions[0].id).toBe('send');
		expect(actions[1].id).toBe('tag');
		expect(actions[2].id).toBe('edit');
		expect(actions[3].id).toBe('move');
		expect(actions[4].id).toBe('trash-contacts-action');
	});
	it('should return [restore, delete permanently] actions in this order when in trash folder', () => {
		populateFoldersStore();
		const folderId = FOLDERS.TRASH;
		const contact = buildContact({ parent: folderId });

		const { result } = setupHook(useContactPreviewActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions[0].id).toBe('restore-contacts-action');
		expect(actions[1].id).toBe('delete-permanently');
	});
});
