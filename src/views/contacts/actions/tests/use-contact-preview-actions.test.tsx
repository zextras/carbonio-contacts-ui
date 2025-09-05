/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';

import {
	DELETE_PERMANENTLY_ACTION,
	EDIT_ACTION,
	MOVE_ACTION,
	RESTORE_ACTION,
	SEND_EMAIL_ACTION,
	SHOW_TAG_ACTION,
	TRASH_ACTION
} from 'constants/actions';
import { buildContact } from 'tests/model-builder';
import { generateLinkFolder } from 'views/contact-groups/tests/utils';
import { useContactPreviewActions } from 'views/contacts/actions/use-contact-preview-actions';
import { setupHook } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('Contact Preview Actions', () => {
	it('should return no actions when folder is not in the store', () => {
		const contact = buildContact({
			parent: `unknown`
		});

		const { result } = setupHook(useContactPreviewActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions.length).toBe(0);
	});

	describe('Main Account', () => {
		it('should return [send, tag, edit, move, trash] actions in this order if not in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.CONTACTS;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactPreviewActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
			expect(actions[1].id).toBe(SHOW_TAG_ACTION.ID);
			expect(actions[2].id).toBe(EDIT_ACTION.ID);
			expect(actions[3].id).toBe(MOVE_ACTION.ID);
			expect(actions[4].id).toBe(TRASH_ACTION.ID);
		});
		it('should return [restore, delete permanently] actions in this order when in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.TRASH;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactPreviewActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe(RESTORE_ACTION.ID);
			expect(actions[1].id).toBe(DELETE_PERMANENTLY_ACTION.ID);
		});
	});

	describe('Shared Account', () => {
		const folderId = '789';
		const remoteAccountUuId = faker.string.uuid();
		const remoteFolderId = '123';
		const contactInSharedFolder = buildContact({
			parent: `${remoteAccountUuId}:${remoteFolderId}`
		});

		describe('Trash folder', () => {
			it('should return no actions when has only Read permission', () => {
				const mountpount = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'r',
					absFolderPath: '/Trash',
					name: 'Trash'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpount }
				});

				const { result } = setupHook(useContactPreviewActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(0);
			});

			it('should return restore, delete permanently actions when has Write permission', () => {
				const mountpount = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'w',
					absFolderPath: '/Trash',
					name: 'Trash'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpount }
				});

				const { result } = setupHook(useContactPreviewActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(2);
				expect(actions[0].id).toBe(RESTORE_ACTION.ID);
				expect(actions[1].id).toBe(DELETE_PERMANENTLY_ACTION.ID);
			});
		});

		describe('Not Trash folder', () => {
			describe('Contacts with tags', () => {
				const contactInSharedFolderWithTags = buildContact({
					parent: `${remoteAccountUuId}:${remoteFolderId}`,
					tags: ['tag1', 'tag2']
				});
				it('should return send and show tag actions when has only Read permission', () => {
					const mountpoint = generateLinkFolder({
						folderId,
						remoteAccountUuId,
						remoteId: remoteFolderId,
						permissions: 'r'
					});
					useFolderStore.setState({
						folders: { [folderId]: mountpoint }
					});
					const { result } = setupHook(useContactPreviewActions, {
						initialProps: [contactInSharedFolderWithTags]
					});

					const actions = result.current;
					expect(actions.length).toBe(2);
					expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
					expect(actions[1].id).toBe(SHOW_TAG_ACTION.ID);
				});

				it('should return send, show tags, edit, move, trash actions when has Write permission', () => {
					const mountpoint = generateLinkFolder({
						folderId,
						remoteAccountUuId,
						remoteId: remoteFolderId,
						permissions: 'w'
					});
					useFolderStore.setState({
						folders: { [folderId]: mountpoint }
					});
					const { result } = setupHook(useContactPreviewActions, {
						initialProps: [contactInSharedFolderWithTags]
					});

					const actions = result.current;
					expect(actions.length).toBe(5);
					expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
					expect(actions[1].id).toBe(SHOW_TAG_ACTION.ID);
					expect(actions[2].id).toBe(EDIT_ACTION.ID);
					expect(actions[3].id).toBe(MOVE_ACTION.ID);
					expect(actions[4].id).toBe(TRASH_ACTION.ID);
				});
			});

			describe('Contacts with no tags', () => {
				const contactInSharedFolderWithNoTags = buildContact({
					parent: `${remoteAccountUuId}:${remoteFolderId}`,
					tags: []
				});
				it('should return only send action when has only Read permission', () => {
					const mountpoint = generateLinkFolder({
						folderId,
						remoteAccountUuId,
						remoteId: remoteFolderId,
						permissions: 'r'
					});
					useFolderStore.setState({
						folders: { [folderId]: mountpoint }
					});
					const { result } = setupHook(useContactPreviewActions, {
						initialProps: [contactInSharedFolderWithNoTags]
					});

					const actions = result.current;
					expect(actions.length).toBe(1);
					expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
				});

				it('should return send, show tags, edit, move, trash actions when has Write permission', () => {
					const mountpoint = generateLinkFolder({
						folderId,
						remoteAccountUuId,
						remoteId: remoteFolderId,
						permissions: 'w'
					});
					useFolderStore.setState({
						folders: { [folderId]: mountpoint }
					});
					const { result } = setupHook(useContactPreviewActions, {
						initialProps: [contactInSharedFolderWithNoTags]
					});

					const actions = result.current;
					expect(actions.length).toBe(4);
					expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
					expect(actions[1].id).toBe(EDIT_ACTION.ID);
					expect(actions[2].id).toBe(MOVE_ACTION.ID);
					expect(actions[3].id).toBe(TRASH_ACTION.ID);
				});
			});
		});
	});
});
