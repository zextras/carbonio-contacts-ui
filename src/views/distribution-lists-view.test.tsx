/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { DistributionListsView } from './distribution-lists-view';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { EMPTY_DISPLAYER_HINT, EMPTY_LIST_HINT, TESTID_SELECTORS } from '../constants/tests';
import { registerGetDistributionListHandler } from '../tests/msw-handlers';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { generateDistributionList, generateDistributionLists } from '../tests/utils';

describe('Distribution Lists View', () => {
	it('should show the list of distribution lists', async () => {
		const items = generateDistributionLists();
		registerGetAccountDistributionListsHandler(items);
		setupTest(
			<Route path={ROUTES.distributionLists}>
				<DistributionListsView />
			</Route>,
			{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`] }
		);
		await screen.findByText(items[0].displayName);
		items.forEach((item) => expect(screen.getByText(item.displayName)).toBeVisible());
	});

	it('should show the empty list placeholder when there are no items', async () => {
		registerGetAccountDistributionListsHandler([]);
		setupTest(
			<Route path={'/:filter'}>
				<DistributionListsView />
			</Route>,
			{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`] }
		);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	describe('Displayer', () => {
		it('should open the displayer when click on a distribution list item', async () => {
			const dl = generateDistributionList();
			registerGetAccountDistributionListsHandler([dl]);
			registerGetDistributionListHandler(dl);

			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>,
				{
					initialEntries: [
						`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}`
					]
				}
			);

			await user.click(await screen.findByText(dl.displayName));
			const displayer = screen.getByTestId(TESTID_SELECTORS.displayer);
			await within(displayer).findByTestId(TESTID_SELECTORS.icons.distributionList);
			expect(await within(displayer).findByText(dl.displayName)).toBeVisible();
		});

		it('should close the displayer when click on close', async () => {
			const dl = generateDistributionList();
			registerGetAccountDistributionListsHandler([dl]);
			registerGetDistributionListHandler(dl);

			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>,
				{
					initialEntries: [
						`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
					]
				}
			);

			const displayerHeader = screen.getByTestId(TESTID_SELECTORS.displayerHeader);
			const closeAction = await within(displayerHeader).findByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.closeDisplayer
			});
			await within(displayerHeader).findByText(dl.displayName);
			await user.click(closeAction);
			expect(await screen.findByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		});
	});
});
