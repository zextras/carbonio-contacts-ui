/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { within } from '@testing-library/react';
import { Route } from 'react-router-dom';

import { DistributionListsView } from './DistributionListsView';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { EMPTY_LIST_HINT, TESTID_SELECTORS } from '../constants/tests';
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

	describe('item of the list', () => {
		it.each([undefined, ''])(
			'should show the email if the displayName is %s',
			async (displayName) => {
				const dl = generateDistributionList({ displayName });
				registerGetAccountDistributionListsHandler([dl]);
				setupTest(
					<Route path={ROUTES.distributionLists}>
						<DistributionListsView />
					</Route>,
					{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`] }
				);
				expect(await screen.findByText(dl.email)).toBeVisible();
			}
		);
	});
	describe('Displayer', () => {
		it('should open the displayer when click on a distribution list item', async () => {
			const dl = generateDistributionList();
			registerGetAccountDistributionListsHandler([dl]);
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
			expect(screen.getByText(dl.email)).toBeVisible();
		});

		it('should render the displayName inside the displayer when click on a distribution list item', async () => {
			const dl = generateDistributionList();
			registerGetAccountDistributionListsHandler([dl]);
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
			expect(within(displayer).getByText(dl.displayName)).toBeVisible();
		});
	});
});
