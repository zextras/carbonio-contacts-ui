/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';
import * as shell from '@zextras/carbonio-shell-ui';

import { screen, setupHook, setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../../constants/tests';
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

describe('Contact Group View', () => {
	it('should show the empty displayer message as default', async () => {
		const NO_CONTACT_MESSAGE = 'It looks like there are no contacts yet';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});
		setupFolderView('1');

		expect(await screen.findByText(NO_CONTACT_MESSAGE)).toBeVisible();
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
		const EMPTY_BOARD_MESSAGE = 'Create a new contact by clicking the “NEW” button.';
		const contactGroupId = '111';
		const contactGroupName = 'My Contact Group';
		const folderId = '7';
		const contactGroup = createCnItem(contactGroupName, [], contactGroupId, folderId);
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup]),
			offset: 0
		});
		const { user } = setupFolderView(folderId);

		const listItem = await screen.findByText(contactGroupName);
		await user.click(listItem);
		const closeButton = screen.getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.closeDisplayer
		});

		expect(screen.getByTestId('contact-group-displayer')).toBeVisible();
		expect(closeButton).toBeVisible();
		expect(closeButton).toBeEnabled();
		await user.click(closeButton);
		expect(screen.queryByTestId('contact-group-displayer')).not.toBeInTheDocument();
		await screen.findByText(EMPTY_BOARD_MESSAGE);
	});

	it('should display list item as active after clicking on it', async () => {
		const contactGroupId = '111';
		const contactGroupName = 'My Contact Group';
		const folderId = '7';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse(
				[
					createCnItem(contactGroupName, [], contactGroupId, folderId),
					...[...Array(2)].map(() => createCnItem())
				],
				false
			),
			offset: 0
		});
		const {
			result: { current: theme }
		} = setupHook(useTheme);
		const activeBackground = `background: ${theme.palette.highlight.focus}`;

		const { user } = setupFolderView(folderId);

		const styledListItem = await screen.findByTestId(`custom-list-item-${contactGroupId}`);
		const listItem = await within(styledListItem).findByText(contactGroupName);
		await user.click(listItem);
		expect(styledListItem).toHaveStyle(activeBackground);
	});

	it('should open the mail board (ContactGroupDisplayerController trigger)', async () => {
		const openMailComposer = jest.fn();
		const contactGroupId = '1';
		const folderId = '20';
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
		const contactGroupName = faker.company.name();
		const member = faker.internet.email();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createCnItem(contactGroupName, [member], contactGroupId, folderId)
			]),
			offset: 0
		});
		const { user } = setupFolderView(folderId);

		const listItem = await screen.findByText(contactGroupName);
		await user.click(listItem);
		const displayer = await screen.findByTestId('contact-group-displayer');
		const openEmailComposerAction = within(displayer).getByRole('button', { name: /mail/i });
		await user.click(openEmailComposerAction);
		expect(openMailComposer).toHaveBeenCalledTimes(1);
		expect(openMailComposer).toHaveBeenCalledWith({
			recipients: [expect.objectContaining({ email: member })]
		});
	});
});
