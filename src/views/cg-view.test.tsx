/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { Route } from 'react-router-dom';

import { CGView } from './cg-view';
import { screen, setupTest, triggerLoadMore } from '../carbonio-ui-commons/test/test-setup';
import { FIND_CONTACT_GROUP_LIMIT, ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
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

		setupTest(<CGView />);

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
		setupTest(<CGView />);

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
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
		setupTest(<CGView />);

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByText('0 addresses')).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 1 address string) of a contact group', async () => {
		const contactGroupName = faker.company.name();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createFindContactGroupsResponseCnItem(contactGroupName, [faker.internet.email()])
			]),
			offset: 0
		});
		setupTest(<CGView />);

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		const listItemContent = screen.getByTestId(TESTID_SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
		expect(screen.getByText('1 address')).toBeVisible();
	});

	it('should show the empty list message if there is no contact group', async () => {
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});

		setupTest(<CGView />);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	describe('Send mail action', () => {
		it('should open the mail board (ContactGroupDisplayerController trigger)', async () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
			const contactGroupName = faker.company.name();
			const member = faker.internet.email();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName, [member])
				]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.contactGroups}`}>
					<CGView />
				</Route>,
				{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}`] }
			);

			await screen.findByText(contactGroupName);
			const listItem = await screen.findByTestId(TESTID_SELECTORS.listItemContent);
			await user.click(listItem);
			const displayer = await screen.findByTestId(TESTID_SELECTORS.displayer);
			const action = within(displayer).getByRole('button', { name: /mail/i });
			await user.click(action);
			expect(openMailComposer).toHaveBeenCalledTimes(1);
			expect(openMailComposer).toHaveBeenCalledWith({ recipients: [{ email: member }] });
		});

		it('should open the mail board (Hover trigger)', async () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
			const contactGroupName = faker.company.name();
			const member = faker.internet.email();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName, [member])
				]),
				offset: 0
			});
			const { user } = setupTest(<CGView />);

			await screen.findAllByText(contactGroupName);
			const action = screen.getByTestId(TESTID_SELECTORS.icons.sendEmail);
			await user.click(action);
			expect(openMailComposer).toHaveBeenCalledTimes(1);
			expect(openMailComposer).toHaveBeenCalledWith({ recipients: [{ email: member }] });
		});

		it('should hide send mail hover action when the contact group has 0 members', async () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
			const contactGroupName = faker.company.name();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName, [])
				]),
				offset: 0
			});
			setupTest(<CGView />);

			await screen.findAllByText(contactGroupName);
			expect(screen.queryByTestId(TESTID_SELECTORS.icons.sendEmail)).not.toBeInTheDocument();
		});

		it('should open the mail board (Contextual menu trigger)', async () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
			const contactGroupName = faker.company.name();
			const member = faker.internet.email();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName, [member])
				]),
				offset: 0
			});
			const { user } = setupTest(<CGView />);

			await screen.findByText(contactGroupName);
			const listItem = await screen.findByTestId(TESTID_SELECTORS.listItemContent);
			await user.rightClick(listItem);

			const contextualMenu = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
			const action = within(contextualMenu).getByText('Send e-mail');
			await user.click(action);
			expect(openMailComposer).toHaveBeenCalledTimes(1);
			expect(openMailComposer).toHaveBeenCalledWith({ recipients: [{ email: member }] });
		});
	});

	describe('Displayer', () => {
		it('should show the empty displayer message as default', async () => {
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([]),
				offset: 0
			});
			setupTest(<CGView />);

			expect(await screen.findByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		});

		it('Click on a list item open the displayer for that item', async () => {
			const contactGroupName = faker.company.name();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([
					createFindContactGroupsResponseCnItem(contactGroupName)
				]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.contactGroups}`}>
					<CGView />
				</Route>,
				{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}`] }
			);
			await screen.findByText(contactGroupName);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			await user.click(screen.getByText(contactGroupName));
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer });
			expect(screen.getAllByText(contactGroupName)).toHaveLength(3);
			// FIXME
			// expect(screen.getByText(/addresses list/i)).toBeVisible();
		});

		it('Click on close action close the displayer', async () => {
			const cnItem = createFindContactGroupsResponseCnItem();
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse([cnItem]),
				offset: 0
			});
			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.contactGroups}`}>
					<CGView />
				</Route>,
				{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${cnItem.id}`] }
			);
			await screen.findAllByText(cnItem.fileAsStr);
			expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
			const closeButton = screen.getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.closeDisplayer
			});
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
});
