/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../../tests/model-builder';
import { useContactContextualMenuActions } from '../use-contact-contextual-menu-actions';
import { generateLinkFolder } from '../../../contact-groups/tests/utils';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';

describe('useContactContextualMenuActions', () => {
	describe('Main Account', () => {
		it('should return [send mail, trash, move, export vCard, apply tags] actions in this order if not in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.CONTACTS;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactContextualMenuActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe('send');
			expect(actions[1].id).toBe('trash-contacts-action');
			expect(actions[2].id).toBe('move');
			expect(actions[3].id).toBe('export-contact-action');
			expect(actions[4].id).toBe('apply');
		});
		it('should return [restore, delete permanently, apply tags] actions in this order when in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.TRASH;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactContextualMenuActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe('restore-contacts-action');
			expect(actions[1].id).toBe('delete-permanently');
			expect(actions[2].id).toBe('apply');
		});
	});

	describe('Shared Account', () => {
		const folderId = '789';
		const remoteAccountUuId = faker.string.uuid();
		const remoteFolderId = '123';
		const contactInSharedFolder = buildContact({
			parent: `${remoteAccountUuId}:${remoteFolderId}`
		});

		it('should return send and export action when NOT in Trash - Read permission', () => {
			const mountpoint = generateLinkFolder({
				folderId,
				remoteAccountUuId,
				remoteId: remoteFolderId,
				permissions: 'r'
			});
			useFolderStore.setState({
				folders: { [folderId]: mountpoint }
			});
			const { result } = setupHook(useContactContextualMenuActions, {
				initialProps: [contactInSharedFolder]
			});

			const actions = result.current;

			expect(actions.length).toBe(2);
			expect(actions[0].id).toBe('send');
			expect(actions[1].id).toBe('export-contact-action');
		});

		// TODO: Fix this test
		// it('should return send and export action when in Trash - Read permission', () => {
		// 	const SHARED_ACCOUNT_TRASH_FOLDER = `uuid:${FOLDERS.TRASH}`;

		// 	const mountpoint = generateLinkFolder({
		// 		folderId: SHARED_ACCOUNT_TRASH_FOLDER,
		// 		remoteAccountUuId,
		// 		remoteId: remoteFolderId,
		// 		permissions: 'r'
		// 	});

		// 	useFolderStore.setState({
		// 		folders: { [folderId]: mountpoint }
		// 	});
		// 	const { result } = setupHook(useContactContextualMenuActions, {
		// 		initialProps: [contactInSharedFolder]
		// 	});

		// 	const actions = result.current;

		// 	expect(actions.length).toBe(2);
		// 	expect(actions[0].id).toBe('restore-contacts-action');
		// 	expect(actions[1].id).toBe('delete-cg-modal');
		// });
	});
});
