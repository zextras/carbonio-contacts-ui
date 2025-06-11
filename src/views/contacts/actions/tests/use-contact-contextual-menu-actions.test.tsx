/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';

import {
	APPLY_TAG_ACTION,
	DELETE_PERMANENTLY_ACTION,
	EXPORT_CONTACT_ACTION,
	MOVE_ACTION,
	RESTORE_ACTION,
	SEND_EMAIL_ACTION,
	TRASH_ACTION
} from 'constants/actions';
import { buildContact } from 'tests/model-builder';
import { generateLinkFolder } from 'views/contact-groups/tests/utils';
import { useContactContextualMenuActions } from 'views/contacts/actions/use-contact-contextual-menu-actions';
import { setupHook } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('useContactContextualMenuActions', () => {
	it('should return no actions when folder is not in the store', () => {
		const contact = buildContact({
			parent: `unknown`
		});

		const { result } = setupHook(useContactContextualMenuActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions.length).toBe(0);
	});
	describe('Main Account', () => {
		it('should return [send mail, trash, move, export vCard, apply tags] actions in this order if not in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.CONTACTS;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactContextualMenuActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
			expect(actions[1].id).toBe(TRASH_ACTION.ID);
			expect(actions[2].id).toBe(MOVE_ACTION.ID);
			expect(actions[3].id).toBe(EXPORT_CONTACT_ACTION.ID);
			expect(actions[4].id).toBe(APPLY_TAG_ACTION.ID);
		});
		it('should return [restore, delete permanently, apply tags] actions in this order when in trash folder', () => {
			populateFoldersStore();
			const folderId = FOLDERS.TRASH;
			const contact = buildContact({ parent: folderId });

			const { result } = setupHook(useContactContextualMenuActions, {
				initialProps: [contact]
			});

			const actions = result.current;
			expect(actions[0].id).toBe(RESTORE_ACTION.ID);
			expect(actions[1].id).toBe(DELETE_PERMANENTLY_ACTION.ID);
			expect(actions[2].id).toBe(APPLY_TAG_ACTION.ID);
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

				const { result } = setupHook(useContactContextualMenuActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(0);
			});

			it('should return restore, delete permanently, apply tag actions when has Write permission', () => {
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

				const { result } = setupHook(useContactContextualMenuActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(3);
				expect(actions[0].id).toBe(RESTORE_ACTION.ID);
				expect(actions[1].id).toBe(DELETE_PERMANENTLY_ACTION.ID);
				expect(actions[2].id).toBe(APPLY_TAG_ACTION.ID);
			});
		});

		describe('Not Trash folder', () => {
			it('should return send and export action when has only Read permission', () => {
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
				expect(actions[0].id).toBe('send-email-action');
				expect(actions[1].id).toBe('export-contact-action');
			});

			it('should return send, trash, move, export, apply tags actions when has Write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'w'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});
				const { result } = setupHook(useContactContextualMenuActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(5);
				expect(actions[0].id).toBe(SEND_EMAIL_ACTION.ID);
				expect(actions[1].id).toBe(TRASH_ACTION.ID);
				expect(actions[2].id).toBe(MOVE_ACTION.ID);
				expect(actions[3].id).toBe(EXPORT_CONTACT_ACTION.ID);
				expect(actions[4].id).toBe(APPLY_TAG_ACTION.ID);
			});
		});
	});
});
