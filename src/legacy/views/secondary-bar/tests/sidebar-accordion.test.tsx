/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import * as shellUi from '@zextras/carbonio-shell-ui';
import * as shell from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { Folder } from '../../../../carbonio-ui-commons/types';
import { SidebarAccordionMui } from '../sidebar-accordion';

describe('Sidebar Accordion', () => {
	beforeEach(() => {
		jest.spyOn(shellUi, 'useLocalStorage').mockReturnValue([[], jest.fn()]);
	});

	const accountId = '123';
	describe('Main account Contact Groups', () => {
		it('should be displayed if Contacts folder is present', async () => {
			const contactsFolder = generateFolder({
				name: 'Contacts',
				id: FOLDERS.CONTACTS,
				children: []
			});
			const folders: Array<Folder> = [contactsFolder];

			setupTest(
				<SidebarAccordionMui
					folders={folders}
					initialExpanded={[]}
					localStorageName={''}
					selectedFolderId={''}
				/>
			);

			expect(await screen.findByText('Contact Groups')).toBeVisible();
		});

		it('should not be displayed if Contacts folder not present', async () => {
			const emailedContactsFolder = generateFolder({
				name: 'Emailed Contacts',
				id: '100',
				children: []
			});
			const trashFolder = generateFolder({ name: 'Trash', id: FOLDERS.TRASH, children: [] });
			const folders: Array<Folder> = [emailedContactsFolder, trashFolder];

			setupTest(
				<SidebarAccordionMui
					folders={folders}
					initialExpanded={[]}
					localStorageName={''}
					selectedFolderId={''}
				/>
			);

			expect(screen.queryByText('Contact Groups')).not.toBeInTheDocument();
		});
	});
	describe('Shared account Contact Groups', () => {
		it('should be displayed if Contacts folder is present', async () => {
			const contactsFolder = generateFolder({
				name: 'Contacts',
				id: `${accountId}:${FOLDERS.CONTACTS}`,
				children: []
			});
			const folders: Array<Folder> = [contactsFolder];

			setupTest(
				<SidebarAccordionMui
					folders={folders}
					initialExpanded={[]}
					localStorageName={''}
					selectedFolderId={''}
				/>
			);

			expect(await screen.findByText('Contact Groups')).toBeVisible();
		});

		it('should not be displayed if Contacts folder not present', async () => {
			const emailedContactsFolder = generateFolder({
				name: 'Emailed Contacts',
				id: `${accountId}:100`,
				children: []
			});
			const trashFolder = generateFolder({ name: 'Trash', id: FOLDERS.TRASH, children: [] });
			const folders: Array<Folder> = [emailedContactsFolder, trashFolder];

			setupTest(
				<SidebarAccordionMui
					folders={folders}
					initialExpanded={[]}
					localStorageName={''}
					selectedFolderId={''}
				/>
			);

			expect(screen.queryByText('Contact Groups')).not.toBeInTheDocument();
		});

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
