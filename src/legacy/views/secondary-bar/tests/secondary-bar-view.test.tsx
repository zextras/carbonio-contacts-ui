/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { useHistory } from 'react-router-dom';

import { FOLDER_VIEW } from '../../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupTest, screen } from '../../../../carbonio-ui-commons/test/test-setup';
import { ROUTES_INTERNAL_PARAMS } from '../../../../constants';
import SecondaryBarView from '../secondary-bar-view';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn()
}));

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

	it('should redirect to mainAccount contact groups when clicking collapsed contact groups', async () => {
		const mainAccountFolders = generateFolder({
			l: '1',
			id: FOLDERS.USER_ROOT,
			name: 'main.account@test.com',
			absFolderPath: '/',
			view: FOLDER_VIEW.contact,
			children: [
				generateFolder({
					id: `${FOLDERS.CONTACTS}`,
					name: 'New Folder',
					absFolderPath: '/newFolder',
					view: FOLDER_VIEW.contact
				})
			]
		});
		await act(async () => {
			useFolderStore.setState({
				folders: {
					'1': mainAccountFolders
				}
			});
		});
		const expandedAccordions = [FOLDERS.USER_ROOT];
		jest.spyOn(shell, 'useLocalStorage').mockReturnValue([expandedAccordions, jest.fn()]);
		const mockReplaceHistory = jest.fn();
		(useHistory as jest.Mock).mockReturnValue({
			replace: mockReplaceHistory
		});

		const { user } = setupTest(<SecondaryBarView expanded={false} />);

		expect(await screen.findByTestId(`sidebar-collapsed`)).toBeVisible();
		const contactGroups = await screen.findByTestId(`sidebar-collapsed-item-contact-groups`);
		const contactGroupsBtnClickable = await within(contactGroups).findByRole('button');
		await act(async () => {
			await user.click(contactGroupsBtnClickable);
		});
		expect(mockReplaceHistory).toHaveBeenCalledTimes(1);
		expect(mockReplaceHistory).toHaveBeenCalledWith(
			`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}`
		);
	});
});
