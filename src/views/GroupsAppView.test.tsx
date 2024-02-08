/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import GroupsAppView from './GroupsAppView';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { GetAccountDistributionListsRequest } from '../network/api/get-account-distribution-lists';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { generateDistributionList } from '../tests/utils';

describe('App view', () => {
	it.todo(/* .each(['/', '/groups']) */ 'should render groups on %s');

	describe('Distribution lists', () => {
		it('should load the list of distribution lists of which the user is member of on /member', async () => {
			const handler = registerGetAccountDistributionListsHandler([]);
			setupTest(<GroupsAppView />, {
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}`
				]
			});
			await waitFor(() => expect(handler).toHaveBeenCalled());
			// TODO: cannot read from json right now
			//  because json is already read inside the handler and throws an error
			// 	"Failed to execute "json" on "IsomorphicRequest": body buffer already read"
			expect(handler.mock.lastCall?.[0].body).toEqual(
				expect.objectContaining({
					Body: {
						GetAccountDistributionListsRequest: expect.objectContaining<
							Partial<GetAccountDistributionListsRequest>
						>({
							ownerOf: true,
							memberOf: 'all'
						})
					}
				})
			);
		});

		it('should load the list of distribution lists of which the user is owner of on /manager', async () => {
			const handler = registerGetAccountDistributionListsHandler([]);
			setupTest(<GroupsAppView />, {
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.manager}`
				]
			});
			await waitFor(() => expect(handler).toHaveBeenCalled());
			// TODO: cannot read from json right now
			//  because json is already read inside the handler and throws the error
			// 	"Failed to execute "json" on "IsomorphicRequest": body buffer already read"
			expect(handler.mock.lastCall?.[0].body).toEqual(
				expect.objectContaining({
					Body: {
						GetAccountDistributionListsRequest: expect.objectContaining<
							Partial<GetAccountDistributionListsRequest>
						>({
							ownerOf: true,
							memberOf: 'none'
						})
					}
				})
			);
		});

		it.each(['', '/', '/wrong'])(
			'should render member filter if a wrong filter `%s` is specified in the path',
			async (nextPath) => {
				const dl = generateDistributionList({ isMember: true });
				const handler = registerGetAccountDistributionListsHandler([dl]);
				setupTest(<GroupsAppView />, {
					initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}${nextPath}`]
				});
				await waitFor(() => expect(handler).toHaveBeenCalled());
				await screen.findByText(dl.displayName);
			}
		);
	});
});
