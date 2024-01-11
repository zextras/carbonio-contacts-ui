/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';
import { Link } from 'react-router-dom';

import GroupsAppView from './GroupsAppView';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { GetAccountDistributionListsRequest } from '../network/api/get-account-distribution-lists';
import {
	createFindContactGroupsResponse,
	createFindContactGroupsResponseCnItem,
	registerFindContactGroupsHandler
} from '../tests/msw-handlers';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { generateDistributionList } from '../tests/utils';

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

	it('should not make a network request when the user navigates back to the distribution list view', async () => {
		const contactGroupName = faker.company.name();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createFindContactGroupsResponseCnItem(contactGroupName)
			]),
			offset: 0
		});
		const dl = generateDistributionList();
		const dlHandler = registerGetAccountDistributionListsHandler([dl]);
		const { user } = setupTest(
			<>
				<Link to={`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}`}>contact group</Link>
				<Link
					to={`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}`}
				>
					distribution list
				</Link>
				<GroupsAppView />
			</>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}`
				]
			}
		);
		expect(await screen.findByText(dl.displayName)).toBeVisible();
		expect(dlHandler).toHaveBeenCalledTimes(1);
		await user.click(screen.getByRole('link', { name: 'contact group' }));
		await waitFor(() => expect(screen.queryByText(dl.displayName)).not.toBeInTheDocument());
		expect(await screen.findByText(contactGroupName)).toBeVisible();
		await user.click(screen.getByRole('link', { name: 'distribution list' }));
		expect(await screen.findByText(dl.displayName)).toBeVisible();
		// the handler is not being called again
		expect(dlHandler).toHaveBeenCalledTimes(1);
	});
});
