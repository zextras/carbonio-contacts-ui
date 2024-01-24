/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';
import { Route } from 'react-router-dom';

import { DLDisplayerController } from './dl-displayer-controller';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS, ZimbraHideInGalType } from '../constants';
import { EMPTY_DISPLAYER_HINT, JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	registerGetDistributionListHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { generateDistributionList } from '../tests/utils';

beforeEach(() => {
	registerGetDistributionListMembersHandler();
});
describe('Distribution List Displayer Controller', () => {
	it('should render empty distribution list displayer suggestions', async () => {
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<DLDisplayerController />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/`
				]
			}
		);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.distributionList)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.getByText(/Select a distribution list or contact the Admin to have one./i)
		).toBeVisible();
	});

	it('should render distribution list data', async () => {
		const description = faker.word.words();
		const dl = generateDistributionList({ description });
		registerGetDistributionListHandler(dl);
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<DLDisplayerController />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		expect(await screen.findAllByText(dl.displayName)).toHaveLength(2);
		expect(screen.getByText(description)).toBeVisible();
	});

	it('should render manager list', async () => {
		const owners = times(10, () => ({
			id: faker.string.uuid(),
			name: faker.internet.email()
		})) satisfies DistributionList['owners'];
		const dl = generateDistributionList({ owners });
		registerGetDistributionListHandler(dl);
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<DLDisplayerController />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		expect(await screen.findByText(/manager list 1/i)).toBeVisible();
		expect(await screen.findByText(owners[0].name)).toBeVisible();
		expect(await screen.findByText(owners[9].name)).toBeVisible();
	});

	describe('Member list', () => {
		it.each(['FALSE', undefined])(
			'should render member list if zimbraHideInGal is %s',
			async (hideParam) => {
				const members = times(10, () => faker.internet.email());
				const dl = generateDistributionList();
				registerGetDistributionListHandler(dl, undefined, hideParam as ZimbraHideInGalType);
				registerGetDistributionListMembersHandler(members);
				setupTest(
					<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
						<DLDisplayerController />
					</Route>,
					{
						initialEntries: [
							`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
						]
					}
				);
				await screen.findAllByText(dl.displayName);
				expect(await screen.findByText(/member list 10/i)).toBeVisible();
				expect(await screen.findByText(members[0])).toBeVisible();
				expect(await screen.findByText(members[9])).toBeVisible();
			}
		);

		it('should render member list if the user is the owner even if the zimbraHideInGal is "TRUE"', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({ isOwner: true });
			registerGetDistributionListHandler(dl, undefined, 'TRUE');
			registerGetDistributionListMembersHandler(members);
			setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DLDisplayerController />
				</Route>,
				{
					initialEntries: [
						`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
					]
				}
			);
			await screen.findAllByText(dl.displayName);
			expect(await screen.findByText(/member list 10/i)).toBeVisible();
			expect(await screen.findByText(members[0])).toBeVisible();
			expect(await screen.findByText(members[9])).toBeVisible();
		});

		it.each([false, undefined])(
			'should not render member list if isOwner is %s and zimbraHideInGal is "TRUE"',
			async (isOwner) => {
				const members = times(10, () => faker.internet.email());
				const dl = generateDistributionList({ isOwner });
				registerGetDistributionListHandler(dl, undefined, 'TRUE');
				registerGetDistributionListMembersHandler(members);
				setupTest(
					<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
						<DLDisplayerController />
					</Route>,
					{
						initialEntries: [
							`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
						]
					}
				);
				await screen.findAllByText(dl.displayName);
				expect(screen.queryByText(/member list/i)).not.toBeInTheDocument();
			}
		);
	});

	it('should show an error snackbar if there is a network error while loading the details', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl, JEST_MOCKED_ERROR);
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<DLDisplayerController />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
	});

	it('should show an error snackbar if there is a network error while loading the member list', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		registerGetDistributionListMembersHandler(undefined, undefined, JEST_MOCKED_ERROR);
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<DLDisplayerController />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		expect(await screen.findAllByText(dl.displayName)).toHaveLength(2);
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
	});
});
