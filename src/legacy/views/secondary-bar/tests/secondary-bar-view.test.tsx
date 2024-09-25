/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';

import { FOLDER_VIEW } from '../../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupTest, screen } from '../../../../carbonio-ui-commons/test/test-setup';
import SecondaryBarView from '../secondary-bar-view';

describe('Secondary Bar', () => {
	it('should not break if empty folders', () => {
		setupTest(<SecondaryBarView expanded={false} />);
	});

	it('should display only mainAccount folders when collapsed', async () => {
		const folderId = '100';
		const sharedFolderId = '56789';
		const mainAccountFolders = generateFolder({
			l: '1',
			id: FOLDERS.USER_ROOT,
			name: 'main.account@test.com',
			absFolderPath: '/',
			view: FOLDER_VIEW.contact,
			children: [
				generateFolder({
					id: `${folderId}`,
					name: 'New Folder',
					absFolderPath: '/newFolder',
					view: FOLDER_VIEW.contact
				})
			]
		});
		const sharedAccountFolders = generateFolder({
			l: '10000',
			id: 'shared.account@test.com',
			name: 'shared.account@test.com',
			absFolderPath: '/shared.account@test.com',
			view: FOLDER_VIEW.contact,
			children: [
				generateFolder({
					id: `${sharedFolderId}`,
					name: 'Other Folder',
					absFolderPath: '/OtherFolder',
					view: FOLDER_VIEW.contact
				})
			]
		});
		await act(async () => {
			useFolderStore.setState({
				folders: {
					'1': mainAccountFolders,
					'2': sharedAccountFolders
				}
			});
		});

		setupTest(<SecondaryBarView expanded={false} />);

		expect(await screen.findByTestId(`sidebar-collapsed`)).toBeVisible();
		expect(await screen.findByTestId(`sidebar-collapsed-item-${folderId}`)).toBeVisible();
		expect(
			screen.queryByTestId(`sidebar-collapsed-item-${sharedFolderId}`)
		).not.toBeInTheDocument();
	});
});
