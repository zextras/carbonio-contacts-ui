/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';

import { ContactGroupView } from './contact-group-view';
import { CONTACT_GROUPS_PATH } from './navigation';
import { screen, setupHook, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, EMPTY_LIST_HINT, TESTID_SELECTORS } from '../../constants/tests';
import { registerDeleteContactHandler } from '../../tests/msw-handlers/delete-contact';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../../tests/utils';

function setupMainAccountContactGroupView(): any {
	return setupTest(<ContactGroupView />, {
		initialEntries: [`/${CONTACT_GROUPS_PATH}/7`]
	});
}

function setupSharedAccountContactGroupView(accountId: string): any {
	return setupTest(<ContactGroupView />, {
		initialEntries: [`/${CONTACT_GROUPS_PATH}/${accountId}`]
	});
}

function getFocusBackgroundStyle(): string {
	const {
		result: { current: theme }
	} = setupHook(useTheme);
	return `background: ${theme.palette.highlight.focus}`;
}

function getActiveBackgroundStyle(): string {
	const {
		result: { current: theme }
	} = setupHook(useTheme);
	return `background: ${theme.palette.gray6.active}`;
}

describe('Contact Group View', () => {
	describe('sharedAccount', () => {
		describe('List', () => {
			it('should render the avatar, the name and the number of the members (case 1+ addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createCnItem(contactGroupName, [faker.internet.email(), faker.internet.email()])
					]),
					offset: 0
				});
				setupMainAccountContactGroupView();

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
				expect(
					within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)
				).toBeVisible();
				expect(screen.getByText('2 addresses')).toBeVisible();
			});

			it('should render the avatar, the name and the number of the members (case 0 addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createCnItem(contactGroupName)
					]),
					offset: 0
				});

				setupSharedAccountContactGroupView('123');

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				expect(screen.getByText('0 addresses')).toBeVisible();
				const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
				expect(
					within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)
				).toBeVisible();
			});

			it('should render the avatar, the name and the number of the members (case 1 address string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createCnItem(contactGroupName, [faker.internet.email()])
					]),
					offset: 0
				});

				setupSharedAccountContactGroupView('123');

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
				expect(
					within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)
				).toBeVisible();
				expect(screen.getByText('1 address')).toBeVisible();
			});

			it('should show the empty list message if there is no contact group', async () => {
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([]),
					offset: 0
				});

				setupSharedAccountContactGroupView('123');

				expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
			});

			it('should remove contact group from list when deleting from list', async () => {
				const sharedContactGroup = createCnItem();
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse(
						[sharedContactGroup, ...[...Array(2)].map(() => createCnItem())],
						false
					),
					offset: 0
				});
				registerDeleteContactHandler(sharedContactGroup.id);

				const { user } = setupSharedAccountContactGroupView('accountId-123');

				await screen.findByText(sharedContactGroup.fileAsStr);

				const listElement = screen
					.getAllByTestId(TESTID_SELECTORS.listItemContent)
					.find((element) => element.textContent?.includes(sharedContactGroup.fileAsStr));

				expect(listElement).toBeVisible();

				const deleteAction = within(listElement as HTMLElement).getByTestId(
					TESTID_SELECTORS.icons.trash
				);

				await user.click(deleteAction);
				const button = await screen.findByRole('button', {
					name: 'delete'
				});
				await user.click(button);
				await screen.findByText('Contact group successfully deleted');

				expect(screen.queryByText(sharedContactGroup.fileAsStr)).not.toBeInTheDocument();
			});

			it('should display list item as active after clicking on it', async () => {
				const accountId = '123';
				const contactGroupId = '10101010';
				const contactGroupName = 'My shared Contact Group';
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse(
						[
							createCnItem(contactGroupName, [], contactGroupId),
							...[...Array(2)].map(() => createCnItem())
						],
						false
					),
					offset: 0
				});

				const { user } = setupTest(<ContactGroupView />, {
					initialEntries: [`/${CONTACT_GROUPS_PATH}/${accountId}`]
				});

				const styledListItem = await screen.findByTestId(`shared-list-item-${contactGroupId}`);
				expect(styledListItem).toHaveStyle(getActiveBackgroundStyle());
				const listItem = await within(styledListItem).findByText(contactGroupName);
				await user.click(listItem);
				await screen.findByTestId('contact-group-displayer');
				expect(styledListItem).toHaveStyle(getFocusBackgroundStyle());
			});
		});

		describe('Displayer', () => {
			it('should display contact details when clicking on it', async () => {
				const contactGroupName = 'My shared Contact Group';
				const soapContactGroup = createCnItem(contactGroupName);
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse(
						[soapContactGroup, ...[...Array(2)].map(() => createCnItem())],
						false
					),
					offset: 0
				});

				const { user } = setupSharedAccountContactGroupView('123');

				await screen.findByText(contactGroupName);
				await screen.findByText(EMPTY_DISPLAYER_HINT);
				await user.click(await screen.findByText(contactGroupName));
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer });
				expect(screen.getAllByText(contactGroupName)).toHaveLength(3);
				expect(screen.getByText('Addresses list')).toBeVisible();
				await screen.findByTestId('contact-group-displayer');
			});
		});
	});
});
