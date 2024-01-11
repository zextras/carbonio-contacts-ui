/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import GroupsAppView from './GroupsAppView';
import { setupTest } from '../carbonio-ui-commons/test/test-setup';
import { GetAccountDistributionListsRequest } from '../network/api/get-account-distribution-lists';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';

describe('App view', () => {
	it.todo(/* .each(['/', '/groups']) */ 'should render groups on %s');

	describe('Distribution lists', () => {
		it('should load the list of distribution lists of which the user is member of on /member', async () => {
			const handler = registerGetAccountDistributionListsHandler([]);
			setupTest(<GroupsAppView />, { initialEntries: ['/distribution-lists/member'] });
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
							ownerOf: false,
							memberOf: 'all'
						})
					}
				})
			);
		});

		it('should load the list of distribution lists of which the user is owner of on /manager', async () => {
			const handler = registerGetAccountDistributionListsHandler([]);
			setupTest(<GroupsAppView />, { initialEntries: ['/distribution-lists/manager'] });
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
	});
});
