/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';
import { times } from 'lodash';
import { Route } from 'react-router-dom';

import { DistributionListsView } from './DistributionListsView';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { EMPTY_LIST_HINT } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { MakeRequired } from '../types/utils';

const generateDistributionList = (
	data: Partial<DistributionList> = {}
): MakeRequired<DistributionList, 'displayName'> => ({
	id: faker.string.uuid(),
	email: faker.internet.email(),
	displayName: faker.internet.displayName(),
	isOwner: faker.datatype.boolean(),
	isMember: faker.datatype.boolean(),
	...data
});

const generateDistributionLists = (
	limit = 10
): Array<ReturnType<typeof generateDistributionList>> =>
	times(limit, () => generateDistributionList());

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
		const handler = registerGetAccountDistributionListsHandler([]);
		setupTest(
			<Route path={'/:filter'}>
				<DistributionListsView />
			</Route>,
			{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`] }
		);
		await waitFor(() => expect(handler).toHaveBeenCalled());
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	describe('item of the list', () => {
		it.each([undefined, ''])(
			'should show the email if the displayName is %s',
			async (displayName) => {
				const dl = generateDistributionList({ displayName });
				const handler = registerGetAccountDistributionListsHandler([dl]);
				setupTest(
					<Route path={ROUTES.distributionLists}>
						<DistributionListsView />
					</Route>,
					{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`] }
				);
				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(await screen.findByText(dl.email)).toBeVisible();
			}
		);
	});
});
