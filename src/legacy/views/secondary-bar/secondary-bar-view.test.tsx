/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { FOLDERS, getUserAccount } from '@zextras/carbonio-shell-ui';

import SecondaryBarView from './secondary-bar-view';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants';
import { getRootsArray } from '../../../carbonio-ui-commons/store/zustand/folder';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { Folder } from '../../../carbonio-ui-commons/types/folder';

describe('Legacy secondary bar', () => {
	it('should show an accordion item for each user root', () => {
		populateFoldersStore({ view: FOLDER_VIEW.contact, noSharedAccounts: false });
		const primaryAccount = getUserAccount();
		setupTest(<SecondaryBarView expanded />);
		getRootsArray().forEach((root: Folder) => {
			const accountName = root.id === FOLDERS.USER_ROOT ? primaryAccount?.name : root.name;
			expect(screen.getByText(accountName ?? '')).toBeVisible();
		});
	});

	it.todo('should show only the accordion for the user roots if the expanded prop is set to false');

	it.todo('should show an accordion for each child of the user root');

	it.todo(
		'should show, only inside the primary user root, a button for search of shared address books'
	);

	it.todo('should show, as last element, an accordion for the tags');

	it.todo(
		'should show an accordion for each existing tag if the user click on the "tags" accordion chevron'
	);

	describe('Actions', () => {});
});
