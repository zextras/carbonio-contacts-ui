/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { waitForElementToBeRemoved, within } from '@testing-library/react';
import { rest } from 'msw';
import { Route } from 'react-router-dom';

import { ContactGroupsView } from './ContactGroupsView';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import {
	makeListItemsVisible,
	setupTest,
	screen,
	triggerLoadMore
} from '../carbonio-ui-commons/test/test-setup';
import { FIND_CONTACT_GROUP_LIMIT, ROUTES } from '../constants';
import { EMPTY_DISPLAYER_HINT, EMPTY_LIST_HINT, TESTID_SELECTORS } from '../constants/tests';
import { useContactGroupStore } from '../store/contact-groups';
import {
	createFindContactGroupsResponse,
	createFindContactGroupsResponseCnItem,
	registerFindContactGroupsHandler
} from '../tests/msw-handlers';

beforeEach(() => {
	useContactGroupStore.getState().setStoredOffset(0);
	useContactGroupStore.getState().emptyStoredContactGroups();
});

describe('Contact Group View', () => {
	it('should load the second page only when bottom element becomes visible', async () => {
		const cnItem1 = createFindContactGroupsResponseCnItem();
		const cnItem101 = createFindContactGroupsResponseCnItem();
		registerFindContactGroupsHandler(
			{
				findContactGroupsResponse: createFindContactGroupsResponse(
					[
						cnItem1,
						...[...Array(FIND_CONTACT_GROUP_LIMIT - 1)].map(() =>
							createFindContactGroupsResponseCnItem()
						)
					],
					true
				),
				offset: 0
			},
			{
				findContactGroupsResponse: createFindContactGroupsResponse([cnItem101], true),
				offset: 100
			}
		);

		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		expect(await screen.findByText(cnItem1.fileAsStr)).toBeVisible();
		expect(screen.queryByText(cnItem101.fileAsStr)).not.toBeInTheDocument();
		triggerLoadMore();
		expect(await screen.findByText(cnItem101.fileAsStr)).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 1+ addresses string) of a contact group', async () => {
		const contactGroupName = faker.company.name();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createFindContactGroupsResponseCnItem(contactGroupName, [
					faker.internet.email(),
					faker.internet.email()
				])
			]),
			offset: 0
		});
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.avatar)).toBeVisible();
		expect(screen.getByText('2 addresses')).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 0 addresses string) of a contact group', async () => {
		const contactGroupName = faker.company.name();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createFindContactGroupsResponseCnItem(contactGroupName)
			]),
			offset: 0
		});
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		expect(await screen.findByText(contactGroupName, undefined, { timeout: 2000 })).toBeVisible();
		expect(screen.getByText('0 addresses')).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.avatar)).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 1 address string) of a contact group', async () => {
		const contactGroupName = faker.company.name();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createFindContactGroupsResponseCnItem(contactGroupName, [faker.internet.email()])
			]),
			offset: 0
		});
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		expect(await screen.findByText(contactGroupName, undefined, { timeout: 2000 })).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.avatar)).toBeVisible();
		expect(screen.getByText('1 address')).toBeVisible();
	});

	describe.skip('Actions', () => {
		it('should render the mail, edit and delete actions on hover', async () => {
			const contactGroupName = faker.company.name();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName)
				]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);

			await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'), {
				timeout: 2000
			});

			await user.hover(await screen.findByText(contactGroupName));
			expect(screen.getByTestId('icon: Edit2Outline')).toBeVisible();
			expect(screen.getByTestId('icon: Trash2Outline')).toBeVisible();
			expect(screen.getByTestId('icon: EmailOutline')).toBeVisible();
		});

		it.todo('should render the dropdown with the actions when right click');

		it.todo('should open the mail board if the user clicks on the mail icon');
	});

	describe.skip('Displayer', () => {
		it('should show the empty list and the empty displayer if there is no contact group', async () => {
			getSetupServer().use(
				rest.post('/service/soap/SearchRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								SearchResponse: {
									sortBy: 'nameAsc',
									offset: 0,
									cn: [],
									more: false,
									_jsns: 'urn:zimbraMail'
								}
							}
						})
					)
				)
			);

			setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);
			expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
			expect(await screen.findByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		});

		it('should show the contact group list and the empty displayer', async () => {
			const contactGroupName = faker.company.name();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName)
				]),
				offset: 0
			});
			setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);

			makeListItemsVisible();
			await screen.findByText(contactGroupName);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			expect(screen.queryByText(EMPTY_LIST_HINT)).not.toBeInTheDocument();
			expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
			expect(screen.getByText(contactGroupName)).toBeVisible();
		});

		test('Click on a list item open the displayer for that item', async () => {
			const contactGroupName = faker.company.name();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName)
				]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);
			await screen.findByText(contactGroupName);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			await user.click(screen.getByText(contactGroupName));
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer });
			expect(screen.getAllByText(contactGroupName)).toHaveLength(2);
			expect(screen.getByText(/addresses list/i)).toBeVisible();
		});

		test('Click on close action close the displayer', async () => {
			const contactGroupName = faker.company.name();
			const contactGroupId = faker.number.int({ min: 100, max: 999 }).toString();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName, undefined, contactGroupId)
				]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>,
				{
					initialEntries: [`/${contactGroupId}`]
				}
			);
			await screen.findAllByText(contactGroupName);
			expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
			const closeButton = screen.getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.closeDisplayer
			});
			expect(closeButton).toBeVisible();
			expect(closeButton).toBeEnabled();
			await user.click(closeButton);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			// contact group name is shown only 1 time, inside the list
			expect(screen.getByText(contactGroupName)).toBeVisible();
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
			).not.toBeInTheDocument();
		});
	});
});
