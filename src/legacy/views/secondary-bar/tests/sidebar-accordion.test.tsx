/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { SidebarAccordionMui } from '../sidebar-accordion';
import React from 'react';
import { Folder } from '../../../../carbonio-ui-commons/types';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen } from '@testing-library/react';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import * as shellUi from '@zextras/carbonio-shell-ui';

describe('Sidebar Accordion', () => {
	describe('Contact Groups', () => {
		beforeEach(() => {
			jest.spyOn(shellUi, 'useLocalStorage').mockReturnValue([[], jest.fn()]);
		});

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
});
