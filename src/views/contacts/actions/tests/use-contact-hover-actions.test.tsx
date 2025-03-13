/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../../tests/model-builder';
import { generateLinkFolder } from '../../../contact-groups/tests/utils';
import { useContactHoverActions } from '../use-contact-hover-actions';

describe('useContactHoverActions', () => {
	beforeAll(() => {
		const mailTo = { id: 'mail-to', label: 'action.send_msg', execute: jest.fn() };
		jest.spyOn(shell, 'getAction').mockReturnValue([mailTo, true]);
	});
	it('should return no actions when folder is not in the store', () => {
		const contact = buildContact({
			parent: `unknown`
		});

		const { result } = setupHook(useContactHoverActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions.length).toBe(0);
	});
	describe('Main Account', () => {
		it('should return [mailTo, edit, move, trash] actions in this order when contact not in trash', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.CONTACTS });

			const { result } = setupHook(useContactHoverActions, { initialProps: [contact] });

			const actions = result.current;

			expect(actions[0].id).toBe('send-email-action');
			expect(actions[1].id).toBe('edit-action');
			expect(actions[2].id).toBe('move-action');
			expect(actions[3].id).toBe('trash-contacts-action');
		});

		it('should return [restore, deletePermanently] actions in this order when contact in trash', () => {
			populateFoldersStore();
			const contact = buildContact({ parent: FOLDERS.TRASH });

			const { result } = setupHook(useContactHoverActions, { initialProps: [contact] });

			const actions = result.current;

			expect(actions[0].id).toBe('restore-contacts-action');
			expect(actions[1].id).toBe('delete-permanently-action');
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

				const { result } = setupHook(useContactHoverActions, {
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

				const { result } = setupHook(useContactHoverActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(2);
				expect(actions[0].id).toBe('restore-contacts-action');
				expect(actions[1].id).toBe('delete-permanently-action');
			});
		});

		describe('Not Trash folder', () => {
			it('should return send action when has only Read permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'r'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});
				const { result } = setupHook(useContactHoverActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(1);
				expect(actions[0].id).toBe('send-email-action');
			});

			it('should return send, edit, move, trash actions when has Write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'w'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});
				const { result } = setupHook(useContactHoverActions, {
					initialProps: [contactInSharedFolder]
				});

				const actions = result.current;
				expect(actions.length).toBe(4);
				expect(actions[0].id).toBe('send-email-action');
				expect(actions[1].id).toBe('edit-action');
				expect(actions[2].id).toBe('move-action');
				expect(actions[3].id).toBe('trash-contacts-action');
			});
		});
	});
});
