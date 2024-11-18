/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import DistributionListAppView from './distribution-list-view';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { generateDistributionList } from '../tests/utils';

describe('App view', () => {
	describe('Distribution lists', () => {
		it.each([ROUTES_INTERNAL_PARAMS.filter.member, ROUTES_INTERNAL_PARAMS.filter.manager])(
			'should render distribution lists on filter %s',
			async (filter) => {
				const dl = generateDistributionList({ isOwner: true, isMember: true });
				const handler = registerGetAccountDistributionListsHandler([dl]);
				setupTest(<DistributionListAppView />, {
					initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${filter}`]
				});
				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(await screen.findByText(dl.displayName)).toBeVisible();
			}
		);

		it.each(['', '/', '/wrong'])(
			'should render member filter if a wrong filter `%s` is specified in the path',
			async (nextPath) => {
				const dl = generateDistributionList({ isMember: true });
				const handler = registerGetAccountDistributionListsHandler([dl]);
				setupTest(<DistributionListAppView />, {
					initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}${nextPath}`]
				});
				await waitFor(() => expect(handler).toHaveBeenCalled());
				await screen.findByText(dl.displayName);
			}
		);
	});
});
