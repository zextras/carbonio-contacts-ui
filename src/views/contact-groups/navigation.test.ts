/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { useNavigate } from 'react-router-dom';

import { useRedirectToContactGroup, useRedirectToContactGroupFolder } from './navigation';
import { generateLinkFolder } from './tests/utils';
import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';
import { generateFolder } from '../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupHook } from '../../carbonio-ui-commons/test/test-setup';
import { buildContactGroup } from '../../tests/model-builder';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: jest.fn()
}));

describe('contact groups navigation', () => {
	describe('useRedirectToContactGroup', () => {
		it('should use the folderId for the redirect', async () => {
			const FOLDER_ID = '7';
			const GROUP_ID = '33';
			const spyNavigate = jest.fn();
			(useNavigate as jest.Mock).mockReturnValue(spyNavigate);
			const contactGroup = buildContactGroup({ parent: FOLDER_ID, id: GROUP_ID });
			useFolderStore.setState({ folders: { [FOLDER_ID]: generateFolder({ id: FOLDER_ID }) } });

			setupHook(() => useRedirectToContactGroup()(contactGroup));

			expect(spyNavigate).toHaveBeenCalledWith(`../folder/${FOLDER_ID}/contact-groups/${GROUP_ID}`);
		});

		it('should use the folderId instead of the mountpoint for the redirect', async () => {
			const FOLDER_ID = '7';
			const GROUP_ID = '33';
			const REMOTE_ACCOUNT_UUID = faker.string.uuid();
			const REMOTE_FOLDER_ID = '123';
			const mountpoint = generateLinkFolder({
				folderId: FOLDER_ID,
				remoteAccountUuId: REMOTE_ACCOUNT_UUID,
				remoteId: REMOTE_FOLDER_ID
			});
			const spyNavigate = jest.fn();
			(useNavigate as jest.Mock).mockReturnValue(spyNavigate);
			const contactGroup = buildContactGroup({
				parent: `${REMOTE_ACCOUNT_UUID}:${REMOTE_FOLDER_ID}`,
				id: GROUP_ID
			});
			useFolderStore.setState({ folders: { [FOLDER_ID]: mountpoint } });

			setupHook(() => useRedirectToContactGroup()(contactGroup));

			expect(spyNavigate).toHaveBeenCalledWith(`../folder/${FOLDER_ID}/contact-groups/${GROUP_ID}`);
		});
	});

	describe('useRedirectToContactGroupFolder', () => {
		it('should use the folderId for the redirect', async () => {
			const FOLDER_ID = '7';
			const GROUP_ID = '33';
			const spyNavigate = jest.fn();
			(useNavigate as jest.Mock).mockReturnValue(spyNavigate);

			const contactGroup = buildContactGroup({ parent: FOLDER_ID, id: GROUP_ID });
			useFolderStore.setState({ folders: { [FOLDER_ID]: generateFolder({ id: FOLDER_ID }) } });

			setupHook(() => useRedirectToContactGroupFolder()(contactGroup));

			expect(spyNavigate).toHaveBeenCalledWith(`../folder/${FOLDER_ID}`);
		});

		it('should use the folderId instead of the mountpoint for the redirect', async () => {
			const FOLDER_ID = '7';
			const GROUP_ID = '33';
			const REMOTE_ACCOUNT_UUID = faker.string.uuid();
			const REMOTE_FOLDER_ID = '123';
			const mountpoint = generateLinkFolder({
				folderId: FOLDER_ID,
				remoteAccountUuId: REMOTE_ACCOUNT_UUID,
				remoteId: REMOTE_FOLDER_ID
			});
			const spyNavigate = jest.fn();
			(useNavigate as jest.Mock).mockReturnValue(spyNavigate);

			const contactGroup = buildContactGroup({
				parent: `${REMOTE_ACCOUNT_UUID}:${REMOTE_FOLDER_ID}`,
				id: GROUP_ID
			});
			useFolderStore.setState({ folders: { [FOLDER_ID]: mountpoint } });

			setupHook(() => useRedirectToContactGroupFolder()(contactGroup));

			expect(spyNavigate).toHaveBeenCalledWith(`../folder/${FOLDER_ID}`);
		});
	});
});
