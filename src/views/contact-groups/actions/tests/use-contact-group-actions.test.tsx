/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { generateFolder } from '@zextras/carbonio-ui-commons';
import { populateFoldersStore } from '@zextras/carbonio-ui-commons';
import { setupHook } from '@zextras/carbonio-ui-commons';
import {
	EDIT_ACTION,
	MOVE_ACTION,
	RESTORE_ACTION,
	SEND_EMAIL_ACTION,
	TRASH_ACTION
} from '../../../../constants/actions';
import { DELETE_PERMANENTLY_ACTION_DESCRIPTOR } from '../../../../constants/tests';
import { buildContactGroup, buildMembers } from '../../../../tests/model-builder';
import { generateLinkFolder } from '../../tests/utils';
import { useContactGroupActions } from '../use-contact-group-actions';

function mockMailComposerIntegration(): void {
	jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
}

describe('useContactGroupActions', () => {
	mockMailComposerIntegration();

	describe('main account folder', () => {
		beforeEach(() => {
			populateFoldersStore();
		});
		describe('Not in trash', () => {
			it('should return [send, edit, move, trash] actions in this exact order', () => {
				const contactGroup = buildContactGroup({
					parent: FOLDERS.CONTACTS,
					members: buildMembers(faker.number.int({ min: 1, max: 3 }))
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroup));
				expect(result.current).toHaveLength(4);
				expect(result.current[0].id).toBe(SEND_EMAIL_ACTION.ID);
				expect(result.current[1].id).toBe(EDIT_ACTION.ID);
				expect(result.current[2].id).toBe(MOVE_ACTION.ID);
				expect(result.current[3].id).toBe(TRASH_ACTION.ID);
			});
			it('should return send mail action as enabled when the contact group has at least 1 member', () => {
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
				const contactGroup = buildContactGroup({
					members: buildMembers(faker.number.int({ min: 1, max: 100 })),
					parent: FOLDERS.CONTACTS
				});
				const { result } = setupHook(() => useContactGroupActions(contactGroup));

				expect(result.current[0]).toEqual(
					expect.objectContaining({
						id: SEND_EMAIL_ACTION.ID,
						label: 'Send e-mail',
						icon: SEND_EMAIL_ACTION.ICON,
						onClick: expect.anything(),
						disabled: false
					})
				);
			});
			it('should return send mail action as disabled when the contact group has 0 members', () => {
				const contactGroup = buildContactGroup({ parent: FOLDERS.CONTACTS, members: [] });
				const { result } = setupHook(() => useContactGroupActions(contactGroup));
				expect(result.current[0]).toEqual(
					expect.objectContaining({
						id: SEND_EMAIL_ACTION.ID,
						label: 'Send e-mail',
						icon: SEND_EMAIL_ACTION.ICON,
						disabled: true,
						onClick: expect.anything()
					})
				);
			});
			it('should return send mail action as enabled when the contact group has at least 1 member and doesnt have write permissions', () => {
				const FOLDER_ID = 'folder-id';
				useFolderStore.setState({
					folders: { [FOLDER_ID]: generateFolder({ id: FOLDER_ID, perm: 'r' }) }
				});

				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
				const contactGroup = buildContactGroup({
					members: buildMembers(faker.number.int({ min: 1, max: 100 })),
					parent: FOLDER_ID
				});
				const { result } = setupHook(() => useContactGroupActions(contactGroup));

				expect(result.current).toHaveLength(1);
				expect(result.current).toContainEqual({
					id: SEND_EMAIL_ACTION.ID,
					label: 'Send e-mail',
					icon: SEND_EMAIL_ACTION.ICON,
					onClick: expect.anything(),
					disabled: false
				});
			});
			it('should return trash action if user has write permission on folder', () => {
				const FOLDER_ID = 'folder-id';
				const contactGroup = buildContactGroup({ parent: FOLDER_ID });
				useFolderStore.setState({
					folders: { [FOLDER_ID]: generateFolder({ id: FOLDER_ID, perm: 'w' }) }
				});
				const { result } = setupHook(() => useContactGroupActions(contactGroup));

				expect(result.current).toContainEqual({
					id: TRASH_ACTION.ID,
					label: 'Delete',
					icon: TRASH_ACTION.ICON,
					onClick: expect.anything()
				});
			});
		});
		describe('Trash folder', () => {
			it('should return delete permanently, restore actions', () => {
				useFolderStore.setState({
					folders: {
						[FOLDERS.TRASH]: generateFolder({
							id: FOLDERS.TRASH,
							absFolderPath: '/trash',
							perm: 'w'
						})
					}
				});
				const contactGroup = buildContactGroup({ parent: FOLDERS.TRASH });
				const { result } = setupHook(() => useContactGroupActions(contactGroup));
				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: RESTORE_ACTION.ID,
					label: 'Restore',
					icon: RESTORE_ACTION.ICON,
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					...DELETE_PERMANENTLY_ACTION_DESCRIPTOR,
					onClick: expect.anything(),
					color: 'error'
				});
			});
			it('should return delete permanently', () => {
				useFolderStore.setState({
					folders: {
						[FOLDERS.TRASH]: generateFolder({
							id: FOLDERS.TRASH,
							absFolderPath: '/trash',
							perm: undefined
						})
					}
				});
				const contactGroup = buildContactGroup({ parent: FOLDERS.TRASH });
				const { result } = setupHook(() => useContactGroupActions(contactGroup));
				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: RESTORE_ACTION.ID,
					label: 'Restore',
					icon: RESTORE_ACTION.ICON,
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					...DELETE_PERMANENTLY_ACTION_DESCRIPTOR,
					onClick: expect.anything(),
					color: 'error'
				});
			});
		});
	});

	describe('Group is in shared folder', () => {
		const folderId = '789';
		const remoteAccountUuId = faker.string.uuid();
		const remoteFolderId = '123';
		const contactGroupInSharedFolder = buildContactGroup({
			parent: `${remoteAccountUuId}:${remoteFolderId}`,
			members: buildMembers(faker.number.int({ min: 1, max: 3 }))
		});

		describe('Not in trash', () => {
			it('should return send, edit, move, trash actions when shared folder has write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'rw'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroupInSharedFolder));

				expect(result.current).toHaveLength(4);
				expect(result.current[0].id).toBe(SEND_EMAIL_ACTION.ID);
				expect(result.current[1].id).toBe(EDIT_ACTION.ID);
				expect(result.current[2].id).toBe(MOVE_ACTION.ID);
				expect(result.current[3].id).toBe(TRASH_ACTION.ID);
			});

			it('should return only send action when shared folder does not have write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'r'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroupInSharedFolder));

				expect(result.current).toHaveLength(1);
				expect(result.current[0].id).toBe(SEND_EMAIL_ACTION.ID);
			});
		});
		describe('Trash folder', () => {
			it('should return delete and restore action when shared folder has write permission', () => {
				const SHARED_ACCOUNT_TRASH_FOLDER = `uuid:${FOLDERS.TRASH}`;
				useFolderStore.setState({
					folders: {
						[SHARED_ACCOUNT_TRASH_FOLDER]: generateFolder({
							id: SHARED_ACCOUNT_TRASH_FOLDER,
							perm: 'w',
							absFolderPath: '/trash'
						})
					}
				});
				const contactGroup = buildContactGroup({ parent: SHARED_ACCOUNT_TRASH_FOLDER });
				const { result } = setupHook(() => useContactGroupActions(contactGroup));

				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: RESTORE_ACTION.ID,
					label: 'Restore',
					icon: RESTORE_ACTION.ICON,
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					...DELETE_PERMANENTLY_ACTION_DESCRIPTOR,
					onClick: expect.anything(),
					color: 'error'
				});
			});
			it('should return no actions when shared folder does not have write permission', () => {
				const SHARED_ACCOUNT_TRASH_FOLDER = `uuid:${FOLDERS.TRASH}`;
				useFolderStore.setState({
					folders: {
						[SHARED_ACCOUNT_TRASH_FOLDER]: generateFolder({
							id: SHARED_ACCOUNT_TRASH_FOLDER,
							perm: 'r',
							absFolderPath: '/trash'
						})
					}
				});
				const contactGroup = buildContactGroup({ parent: SHARED_ACCOUNT_TRASH_FOLDER });
				const { result } = setupHook(() => useContactGroupActions(contactGroup));

				expect(result.current).toHaveLength(0);
			});
		});
	});
});
