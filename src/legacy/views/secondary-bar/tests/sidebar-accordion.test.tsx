/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { Folder } from '../../../../carbonio-ui-commons/types';
import { SidebarAccordionMui } from '../sidebar-accordion';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useHistory: jest.fn()
}));

describe('Sidebar Accordion', () => {
	beforeEach(() => {
		jest.spyOn(shell, 'useLocalStorage').mockReturnValue([[], jest.fn()]);
	});

	describe('Shared account Contact Groups', () => {
		it('should show FindShare button only on the main account when expanded', async () => {
			const sharedAccountFolderId = '200';
			const expandedAccordions = [FOLDERS.USER_ROOT, sharedAccountFolderId];
			jest.spyOn(shell, 'useLocalStorage').mockReturnValue([expandedAccordions, jest.fn()]);
			const mainAccount = generateFolder({
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
			const sharedAccount = generateFolder({
				name: 'sharedAccount',
				id: sharedAccountFolderId,
				children: []
			});
			const folders: Array<Folder> = [mainAccount, sharedAccount];

			setupTest(
				<SidebarAccordionMui
					folders={folders}
					initialExpanded={expandedAccordions}
					localStorageName={''}
					selectedFolderId={''}
				/>
			);

			const findSharesBtn = await screen.findAllByTestId('button-find-shares');
			expect(findSharesBtn.length).toBe(1);
			expect(findSharesBtn[0]).toBeVisible();
		});
	});
});
