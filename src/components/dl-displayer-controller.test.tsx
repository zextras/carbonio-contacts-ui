/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { BooleanString } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { DLDisplayerController } from './dl-displayer-controller';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	buildGetDistributionListResponse,
	registerGetDistributionListHandler
} from '../tests/msw-handlers/get-distribution-list';
import { registerGetDistributionListMembersHandler } from '../tests/msw-handlers/get-distribution-list-members';
import { buildSoapResponse, generateDistributionList } from '../tests/utils';

beforeEach(() => {
	registerGetDistributionListMembersHandler();
});

describe('Distribution List Displayer Controller', () => {
	it('should render empty distribution list displayer suggestions', async () => {
		setupTest(<DLDisplayerController id={undefined} />);
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
		setupTest(<DLDisplayerController id={dl.id} />);
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
		const { user } = setupTest(<DLDisplayerController id={dl.id} />);
		await user.click(await screen.findByText(/manager list/i));
		expect(await screen.findByText(/manager list 1/i)).toBeVisible();
		expect(await screen.findByText(owners[0].name)).toBeVisible();
		expect(await screen.findByText(owners[9].name)).toBeVisible();
	});

	describe('Member list', () => {
		it.each<BooleanString | undefined>(['FALSE', undefined])(
			'should render member list if zimbraHideInGal is %s',
			async (hideParam) => {
				const members = times(10, () => faker.internet.email());
				const dl = generateDistributionList({});
				registerGetDistributionListHandler(dl).mockImplementation((req, res, ctx) => {
					const response = buildGetDistributionListResponse(dl);
					response.dl[0]._attrs = { ...response.dl[0]._attrs, zimbraHideInGal: hideParam };
					return res(ctx.json(buildSoapResponse({ GetDistributionListResponse: response })));
				});
				registerGetDistributionListMembersHandler(members);
				const { user } = setupTest(<DLDisplayerController id={dl.id} />);
				await screen.findAllByText(dl.displayName);
				await user.click(screen.getByText(/member list/i));
				expect(await screen.findByText(/member list 10/i)).toBeVisible();
				expect(await screen.findByText(members[0])).toBeVisible();
				expect(await screen.findByText(members[9])).toBeVisible();
			}
		);

		it('should render member list if the user is the owner even if the zimbraHideInGal is "TRUE"', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({ isOwner: true });
			registerGetDistributionListHandler(dl).mockImplementation((req, res, ctx) => {
				const response = buildGetDistributionListResponse(dl);
				response.dl[0]._attrs = { ...response.dl[0]._attrs, zimbraHideInGal: 'TRUE' };
				response.dl[0].isOwner = true;
				return res(ctx.json(buildSoapResponse({ GetDistributionListResponse: response })));
			});
			registerGetDistributionListMembersHandler(members);
			const { user } = setupTest(<DLDisplayerController id={dl.id} />);
			await screen.findAllByText(dl.displayName);
			await user.click(screen.getByText(/member list/i));
			expect(await screen.findByText(/member list 10/i)).toBeVisible();
			expect(await screen.findByText(members[0])).toBeVisible();
			expect(await screen.findByText(members[9])).toBeVisible();
		});

		it.each([false, undefined])(
			'should not render member list if isOwner is %s and zimbraHideInGal is "TRUE"',
			async (isOwner) => {
				const members = times(10, () => faker.internet.email());
				const dl = generateDistributionList({ isOwner });
				registerGetDistributionListHandler(dl).mockImplementation((req, res, ctx) => {
					const response = buildGetDistributionListResponse(dl);
					response.dl[0]._attrs = { ...response.dl[0]._attrs, zimbraHideInGal: 'TRUE' };
					response.dl[0].isOwner = isOwner;
					return res(ctx.json(buildSoapResponse({ GetDistributionListResponse: response })));
				});
				registerGetDistributionListMembersHandler(members);
				const { user } = setupTest(<DLDisplayerController id={dl.id} />);
				await screen.findAllByText(dl.displayName);
				expect(screen.getByText(/member list/i)).toBeVisible();
				await user.click(screen.getByText(/member list/i));
				expect(screen.queryByTestId(TESTID_SELECTORS.membersListItem)).not.toBeInTheDocument();
				expect(
					await screen.findByText(
						"You don't have the permissions to see the members of this distribution list. For more information, ask to the administrator."
					)
				).toBeVisible();
			}
		);
	});

	it('should show an error snackbar if there is a network error while loading the details', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl, JEST_MOCKED_ERROR);
		setupTest(<DLDisplayerController id={dl.id} />);
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
	});

	it.skip('should show an error snackbar if there is a network error while loading the member list', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		registerGetDistributionListMembersHandler(undefined, undefined, JEST_MOCKED_ERROR);
		setupTest(<DLDisplayerController id={dl.id} />);
		expect(await screen.findAllByText(dl.displayName)).toHaveLength(2);
		expect(await screen.findByText(/Something went wrong, please try again/i)).toBeVisible();
	});
});
