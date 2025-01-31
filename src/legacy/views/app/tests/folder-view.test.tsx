/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';

import { screen, setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../../../../constants/tests';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../../../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../../../../tests/utils';
import { generateStore } from '../../../tests/generators/store';
import { FolderView } from '../folder-view';

function setupFolderView(folderId: string): any {
	const store = generateStore();
	return setupTest(<FolderView />, {
		initialEntries: [`/folder/${folderId}`],
		store
	});
}

describe('Contact Group Displayer', () => {
	it('should show the empty displayer message as default', async () => {
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});
		setupFolderView('1');

		expect(await screen.findByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
	});

	it('Clicking on a contact group in the list opens the displayer for that item', async () => {
		const contactGroupName = faker.company.name();
		const folderId = '100';
		const contactGroup = createCnItem(contactGroupName, [], '1', folderId);
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup]),
			offset: 0
		});

		const { user } = setupFolderView(folderId);

		await screen.findByText(contactGroupName);
		await user.click(screen.getByText(contactGroupName));
		await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer });
		expect(screen.getAllByText(contactGroupName)).toHaveLength(3);
		expect(screen.getByText('Addresses list')).toBeVisible();
	});

	it('Click on close action closes the displayer', async () => {
		const cnItem = createCnItem();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([cnItem]),
			offset: 0
		});
		const { user } = setupFolderView();
		await screen.findAllByText(cnItem.fileAsStr);
		const listItem = within(screen.getByTestId(TESTID_SELECTORS.mainList)).getByText(
			cnItem.fileAsStr
		);
		await user.click(listItem);
		expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
		const closeButton = screen.getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.closeDisplayer
		});
		await screen.findByTestId('contact-group-displayer');
		expect(closeButton).toBeVisible();
		expect(closeButton).toBeEnabled();
		await user.click(closeButton);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		// contact group name is shown only 1 time, inside the list
		expect(screen.getByText(cnItem.fileAsStr)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});
});
