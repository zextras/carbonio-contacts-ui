/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { CONTACT_GROUP_DELETE_ICON } from './constants';
import { useContactGroupActions } from './use-contact-group-actions';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupHook } from '../../../carbonio-ui-commons/test/test-setup';
import { ACTION_IDS } from '../../../constants';
import { generateStore } from '../../../legacy/tests/generators/store';
import { buildContactGroup, buildMembers } from '../../../tests/model-builder';
import { generateLinkFolder } from '../tests/utils';

function mockMailComposerIntegration(): void {
	jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
}

describe('useContactGroupActions', () => {
	const store = generateStore();
	mockMailComposerIntegration();

	describe('Group is in shared folder/mountpoint', () => {
		const folderId = '789';
		const remoteAccountUuId = faker.string.uuid();
		const remoteFolderId = '123';
		const contactGroupInSharedFolder = buildContactGroup({
			parent: `${remoteAccountUuId}:${remoteFolderId}`,
			members: buildMembers(faker.number.int({ min: 1, max: 3 }))
		});

		describe('Not in trash', () => {
			it('should return send, edit, trash actions when shared folder/mountpoint has write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'rw'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroupInSharedFolder), {
					store
				});

				expect(result.current).toHaveLength(3);
				expect(result.current[0].id).toBe(ACTION_IDS.sendEmailCG);
				expect(result.current[1].id).toBe(ACTION_IDS.editCG);
				expect(result.current[2].id).toBe(ACTION_IDS.trashContacts);
			});

			it('should return only send action when shared folder/mountpoint does not have write permission', () => {
				const mountpoint = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId,
					permissions: 'r'
				});
				useFolderStore.setState({
					folders: { [folderId]: mountpoint }
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroupInSharedFolder), {
					store
				});

				expect(result.current).toHaveLength(1);
				expect(result.current[0].id).toBe(ACTION_IDS.sendEmailCG);
			});
		});
		describe('Trash folder', () => {
			it('should return delete and restore action when group is on a trash folder of a shared account and has write permission', () => {
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
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });

				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: ACTION_IDS.restoreContacts,
					label: 'Restore',
					icon: 'RestoreOutline',
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					id: ACTION_IDS.deletePermanently,
					label: 'Delete Permanently',
					icon: CONTACT_GROUP_DELETE_ICON,
					onClick: expect.anything(),
					color: 'error'
				});
			});
		});
	});

	describe('Group is not in a shared folder (main account folder)', () => {
		describe('Not in trash', () => {
			it('should return [send, edit, move, trash] actions in this exact order', () => {
				const folderId = 'folder-id';
				useFolderStore.setState({
					folders: { [folderId]: generateFolder({ id: folderId, perm: undefined }) }
				});
				const contactGroup = buildContactGroup({
					parent: folderId,
					members: buildMembers(faker.number.int({ min: 1, max: 3 }))
				});

				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });
				expect(result.current).toHaveLength(4);
				expect(result.current[0].id).toBe(ACTION_IDS.sendEmailCG);
				expect(result.current[1].id).toBe(ACTION_IDS.editCG);
				expect(result.current[2].id).toBe(ACTION_IDS.moveContacts);
				expect(result.current[3].id).toBe(ACTION_IDS.trashContacts);
			});
			it('should return send mail action as enabled when the contact group has at least 1 member', () => {
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
				const contactGroup = buildContactGroup({
					members: buildMembers(faker.number.int({ min: 1, max: 100 }))
				});
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });

				expect(result.current[0]).toEqual(
					expect.objectContaining({
						id: ACTION_IDS.sendEmailCG,
						label: 'Send e-mail',
						icon: 'EmailOutline',
						onClick: expect.anything(),
						disabled: false
					})
				);
			});
			it('should return send mail action as disabled when the contact group has 0 members', () => {
				const contactGroup = buildContactGroup();
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });
				expect(result.current[0]).toEqual(
					expect.objectContaining({
						id: ACTION_IDS.sendEmailCG,
						label: 'Send e-mail',
						icon: 'EmailOutline',
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
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });

				expect(result.current).toHaveLength(1);
				expect(result.current).toContainEqual({
					id: ACTION_IDS.sendEmailCG,
					label: 'Send e-mail',
					icon: 'EmailOutline',
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
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });

				expect(result.current).toContainEqual({
					id: ACTION_IDS.trashContacts,
					label: 'Delete',
					icon: 'Trash2Outline',
					onClick: expect.anything()
				});
			});
		});
		describe('Trash folder', () => {
			it('should return delete permanently, restore actions when user has write permission', () => {
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
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });
				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: ACTION_IDS.restoreContacts,
					label: 'Restore',
					icon: 'RestoreOutline',
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					id: ACTION_IDS.deletePermanently,
					label: 'Delete Permanently',
					icon: CONTACT_GROUP_DELETE_ICON,
					onClick: expect.anything(),
					color: 'error'
				});
			});
			it('should return delete permanently, restore actions also when user doesnt have any permission', () => {
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
				const { result } = setupHook(() => useContactGroupActions(contactGroup), { store });
				expect(result.current).toHaveLength(2);
				expect(result.current[0]).toEqual({
					id: ACTION_IDS.restoreContacts,
					label: 'Restore',
					icon: 'RestoreOutline',
					onClick: expect.anything()
				});
				expect(result.current[1]).toEqual({
					id: ACTION_IDS.deletePermanently,
					label: 'Delete Permanently',
					icon: CONTACT_GROUP_DELETE_ICON,
					onClick: expect.anything(),
					color: 'error'
				});
			});
		});
	});
});
