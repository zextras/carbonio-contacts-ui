/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';
import { ErrorSoapResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';
import { Route } from 'react-router-dom';

import { DistributionListsView } from './distribution-lists-view';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { NAMESPACES } from '../constants/api';
import { EMPTY_DISPLAYER_HINT, EMPTY_LIST_HINT, TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../network/api/get-distribution-list';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../network/api/get-distribution-list-members';
import {
	registerGetDistributionListHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import {
	buildSoapResponse,
	generateDistributionList,
	generateDistributionLists
} from '../tests/utils';

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
			await within(displayer).findAllByTestId(TESTID_SELECTORS.icons.distributionList);
			expect(await within(displayer).findAllByText(dl.displayName)).toHaveLength(2);
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

		it('should show only members of the new active distribution list starting from first page when setting a different distribution list as active with the displayer already open', async () => {
			const dl1 = generateDistributionList();
			const dl2 = generateDistributionList();
			registerGetAccountDistributionListsHandler([dl1, dl2]);
			const getDLHandler = registerGetDistributionListHandler(dl1);
			getDLHandler.mockImplementation(async (req, res, ctx) => {
				const {
					Body: {
						GetDistributionListRequest: {
							dl: { _content }
						}
					}
				} = await req.json<{
					Body: { GetDistributionListRequest: GetDistributionListRequest };
				}>();
				let resData: DistributionList | undefined;
				if (_content === dl1.id || _content === dl1.email) {
					resData = dl1;
				}
				if (_content === dl2.id || _content === dl2.email) {
					resData = dl2;
				}

				if (resData === undefined) {
					return res(
						ctx.json<ErrorSoapResponse>({
							Header: {
								context: {}
							},
							Body: {
								Fault: {
									Detail: {
										Error: {
											Code: '',
											Detail: 'DL not found'
										}
									},
									Reason: {
										Text: 'DL not found'
									}
								}
							}
						})
					);
				}

				return res(
					ctx.json(
						buildSoapResponse<GetDistributionListResponse>({
							GetDistributionListResponse: {
								_jsns: NAMESPACES.account,
								dl: [
									{
										id: resData.id,
										name: resData.email,
										isOwner: resData.isOwner,
										owners: resData.owners?.map((owner) => ({ owner: [owner] })),
										_attrs: {
											displayName: resData.displayName,
											description: resData.description
										}
									}
								]
							}
						})
					)
				);
			});

			const dl1Members = times(7, () => faker.internet.email());
			const dl2Members = times(10, () => faker.internet.email());

			const getMembersHandler = registerGetDistributionListMembersHandler();
			getMembersHandler.mockImplementation(async (req, res, ctx) => {
				const {
					Body: {
						GetDistributionListMembersRequest: {
							dl: { _content },
							offset
						}
					}
				} = await req.json<{
					Body: {
						GetDistributionListMembersRequest: GetDistributionListMembersRequest;
					};
				}>();

				if (_content === dl2.email && offset !== 0) {
					return res(
						ctx.json<ErrorSoapResponse>({
							Header: {
								context: {}
							},
							Body: {
								Fault: {
									Detail: {
										Error: {
											Code: '',
											Detail: 'Received offset greater than 0 while loading first page of dl2'
										}
									},
									Reason: {
										Text: 'Received offset greater than 0 while loading first page of dl2'
									}
								}
							}
						})
					);
				}
				let data: Array<string> | undefined;
				if (_content === dl1.email) {
					data = dl1Members;
				}
				if (_content === dl2.email) {
					data = dl2Members;
				}
				if (data === undefined) {
					return res(
						ctx.json<ErrorSoapResponse>({
							Header: {
								context: {}
							},
							Body: {
								Fault: {
									Detail: {
										Error: {
											Code: '',
											Detail: 'DL not found'
										}
									},
									Reason: {
										Text: 'DL not found'
									}
								}
							}
						})
					);
				}
				return res(
					ctx.json(
						buildSoapResponse<GetDistributionListMembersResponse>({
							GetDistributionListMembersResponse: {
								_jsns: NAMESPACES.account,
								dlm: data.map((item) => ({ _content: item })),
								more: false,
								total: data.length
							}
						})
					)
				);
			});

			const { user } = setupTest(
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>,
				{
					initialEntries: [
						`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl1.id}`
					]
				}
			);

			await screen.findByText(dl2.displayName);
			const displayer = screen.getByTestId(TESTID_SELECTORS.displayer);
			await within(displayer).findAllByText(dl1.displayName);
			await screen.findByText(dl1Members[0]);
			await user.click(screen.getByText(dl2.displayName));
			await waitFor(() =>
				expect(within(displayer).queryByText(dl2.displayName)).not.toBeInTheDocument()
			);
			expect(await within(displayer).findAllByText(dl2.displayName)).toHaveLength(2);
			expect(await screen.findByText(dl2Members[0])).toBeVisible();
			expect(screen.getByText(/member list 10/i)).toBeVisible();
			expect(screen.queryByText(dl1Members[0])).not.toBeInTheDocument();
		});
	});
});
