/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { ACTION_IDS } from '../../../../constants';
import { buildContact } from '../../../../tests/model-builder';
import { generateLinkFolder } from '../../../contact-groups/tests/utils';
import { useContactPreviewActions } from '../use-contact-preview-actions';

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
			expect(actions[0].id).toBe(ACTION_IDS.sendEmail);
			expect(actions[1].id).toBe('tag');
			expect(actions[2].id).toBe(ACTION_IDS.edit);
			expect(actions[3].id).toBe(ACTION_IDS.move);
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
			expect(actions[1].id).toBe(ACTION_IDS.deletePermanently);
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
				expect(actions[0].id).toBe('restore-contacts-action');
				expect(actions[1].id).toBe('delete-permanently-action');
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
					expect(actions[0].id).toBe(ACTION_IDS.sendEmail);
					expect(actions[1].id).toBe('tag');
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
					expect(actions[0].id).toBe(ACTION_IDS.sendEmail);
					expect(actions[1].id).toBe('tag');
					expect(actions[2].id).toBe(ACTION_IDS.edit);
					expect(actions[3].id).toBe(ACTION_IDS.move);
					expect(actions[4].id).toBe('trash-contacts-action');
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
					expect(actions[0].id).toBe(ACTION_IDS.sendEmail);
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
					expect(actions[0].id).toBe(ACTION_IDS.sendEmail);
					expect(actions[1].id).toBe(ACTION_IDS.edit);
					expect(actions[2].id).toBe(ACTION_IDS.move);
					expect(actions[3].id).toBe('trash-contacts-action');
				});
			});
		});
	});
});
