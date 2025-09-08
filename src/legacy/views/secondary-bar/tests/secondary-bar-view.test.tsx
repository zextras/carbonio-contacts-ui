/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, waitFor } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { FOLDER_VIEW, FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';

import { setupTest, screen } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import SecondaryBarView from 'legacy/views/secondary-bar/secondary-bar-view';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn()
}));

describe('Secondary Bar', () => {
	it('should not break if empty folders', () => {
		setupTest(<SecondaryBarView expanded={false} />);
	});
	it('should display FindShare button only on the main account when all folders expanded', async () => {
		const sharedAccountFolderId = '200';
		const expandedAccordions = [FOLDERS.USER_ROOT, sharedAccountFolderId];
		jest.spyOn(shell, 'useLocalStorage').mockReturnValue([expandedAccordions, jest.fn()]);
		const mainAccountFolder = generateFolder({
			name: 'userRoot',
			id: FOLDERS.USER_ROOT,
			children: [
				generateFolder({
					parent: FOLDERS.USER_ROOT,
					name: 'aChild',
					id: '100',
					children: []
				})
			]
		});
		const sharedAccountFolder = generateFolder({
			name: 'sharedAccount',
			id: sharedAccountFolderId,
			children: []
		});
		useFolderStore.setState({
			folders: {
				'1': mainAccountFolder,
				'2': sharedAccountFolder
			}
		});

		setupTest(<SecondaryBarView expanded />, {
			initialEntries: [`/folder/${mainAccountFolder.id}`]
		});

		await waitFor(() => {
			expect(screen.getByTestId(`button-find-shares`)).toBeVisible();
		});
		const findSharesBtn = screen.getAllByTestId('button-find-shares');
		expect(findSharesBtn.length).toBe(1);
		expect(findSharesBtn[0]).toBeVisible();
	});

	it('should display only mainAccount folders when collapsed (sidebar minimized)', async () => {
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
