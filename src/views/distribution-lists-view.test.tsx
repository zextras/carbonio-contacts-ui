/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';
import { ErrorSoapResponse } from '@zextras/carbonio-shell-ui';
import { EventEmitter } from 'events';
import { times } from 'lodash';
import { Link, Route } from 'react-router-dom';

import { DistributionListsView } from './distribution-lists-view';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { NAMESPACES } from '../constants/api';
import {
	EMPTY_DISPLAYER_HINT,
	EMPTY_DISTRIBUTION_LIST_HINT,
	JEST_MOCKED_ERROR,
	TESTID_SELECTORS
} from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	GetAccountDistributionListsRequest,
	GetAccountDistributionListsResponse
} from '../network/api/get-account-distribution-lists';
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
	buildSoapError,
	buildSoapResponse,
	delayUntil,
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

	it('should render empty list message when the distribution list is empty', async () => {
		const handler = registerGetAccountDistributionListsHandler([]);
		setupTest(
			<Route path={ROUTES.distributionLists}>
				<DistributionListsView />
			</Route>,
			{
				initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`]
			}
		);
		await waitFor(() => expect(handler).toHaveBeenCalled());
		expect(screen.getByText(EMPTY_DISTRIBUTION_LIST_HINT)).toBeVisible();
	});

	it('should show empty message while loading a list and another list of a different filter has been already loaded', async () => {
		const EMIT_ON = 'resolve-manager';
		const emitter = new EventEmitter();
		const memberList = generateDistributionLists(1);
		const managerList = generateDistributionLists(1);
		const getAccountDLHandler = registerGetAccountDistributionListsHandler([]);
		getAccountDLHandler.mockImplementation(async (req, res, ctx) => {
			const {
				Body: {
					GetAccountDistributionListsRequest: { ownerOf, memberOf }
				}
			} = await req.json<{
				Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest };
			}>();
			const resData: DistributionList[] = [];
			if (ownerOf) {
				await delayUntil(emitter, EMIT_ON);
				resData.push(...managerList);
			}

			if (memberOf !== 'none') {
				resData.push(...memberList);
			}

			return res(
				ctx.json(
					buildSoapResponse<GetAccountDistributionListsResponse>({
						GetAccountDistributionListsResponse: {
							_jsns: NAMESPACES.account,
							dl: resData.map((item) => ({
								id: item.id,
								name: item.email,
								d: item.displayName,
								isOwner: item.isOwner,
								isMember: item.isMember
							}))
						}
					})
				)
			);
		});

		const { user } = setupTest(
			<>
				<Link to={`/${ROUTES_INTERNAL_PARAMS.filter.manager}`}>Manager</Link>
				<Route path={ROUTES.distributionLists}>
					<DistributionListsView />
				</Route>
			</>,
			{
				initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}`]
			}
		);
		expect(await screen.findByText(memberList[0].displayName)).toBeVisible();
		await user.click(screen.getByRole('link', { name: 'Manager' }));
		// // FIXME: for some reason, something to "slow down"
		//  the test is needed to allow react to update the ui,
		//  and make the following waitFor work even when run with all other tests
		await waitFor(
			() =>
				new Promise((resolve) => {
					setTimeout(resolve, 0);
				})
		);
		await waitFor(() =>
			expect(screen.queryByText(memberList[0].displayName)).not.toBeInTheDocument()
		);
		expect(await screen.findByText(EMPTY_DISTRIBUTION_LIST_HINT)).toBeVisible();
		await waitFor(() => expect(getAccountDLHandler).toHaveBeenCalledTimes(2));
		emitter.emit(EMIT_ON);
		expect(await screen.findByText(managerList[0].displayName)).toBeVisible();
	});

	it('should show an error snackbar if there is a network error while loading the list', async () => {
		registerGetAccountDistributionListsHandler([], JEST_MOCKED_ERROR);
		setupTest(
			<Route path={ROUTES.distributionLists}>
				<DistributionListsView />
			</Route>,
			{
				initialEntries: [`/${ROUTES_INTERNAL_PARAMS.filter.member}/`]
			}
		);
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
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

			const displayerHeader = await screen.findByTestId(TESTID_SELECTORS.displayerHeader);
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
					return res(ctx.json(buildSoapError('DL not found')));
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
						ctx.json(
							buildSoapError('Received offset greater than 0 while loading first page of dl2')
						)
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
					return res(ctx.json<ErrorSoapResponse>(buildSoapError('DL not found')));
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
			const displayer = await screen.findByTestId(TESTID_SELECTORS.displayer);
			await user.click(await screen.findByText(/member list/i));
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
