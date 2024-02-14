/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { times } from 'lodash';

import { useGetDistributionListMembers } from './use-get-distribution-list-members';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../constants/api';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../network/api/get-distribution-list-members';
import { useDistributionListsStore } from '../store/distribution-lists';
import { registerGetDistributionListMembersHandler } from '../tests/msw-handlers/get-distribution-list-members';
import {
	buildSoapResponse,
	generateDistributionList,
	generateDistributionListMembersPage
} from '../tests/utils';

describe('Use get distribution list members hook', () => {
	it('should request members to the network if members are not stored', async () => {
		const members = times(faker.number.int({ min: 1, max: 10 }), () => faker.internet.email());
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler(members);
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const { result } = setupHook(useGetDistributionListMembers, { initialProps: [dl.email] });
		await waitFor(() => expect(result.current.members).toStrictEqual(members));
		expect(result.current.total).toEqual(members.length);
		expect(handler).toHaveBeenCalled();
	});

	it('should not make network request if members are stored', async () => {
		const members = times(faker.number.int({ min: 1, max: 10 }), () => faker.internet.email());
		const dl = generateDistributionList({ members: generateDistributionListMembersPage(members) });
		const handler = registerGetDistributionListMembersHandler(members);
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const { result } = setupHook(useGetDistributionListMembers, { initialProps: [dl.email] });
		await waitFor(() => expect(result.current.members).toStrictEqual(members));
		expect(result.current.total).toEqual(members.length);
		expect(handler).not.toHaveBeenCalled();
	});

	it('should make only one network request to load data', async () => {
		const members = times(faker.number.int({ min: 1, max: 10 }), () => faker.internet.email());
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler(members);
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const { result: result1 } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email]
		});
		await waitFor(() => expect(result1.current.members).toStrictEqual(members));
		expect(handler).toHaveBeenCalledTimes(1);
		const { result: result2 } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email]
		});
		await waitFor(() => expect(result2.current.members).toStrictEqual(members));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('should sum members when findMore is called', async () => {
		const firstPage = times(faker.number.int({ min: 1, max: 10 }), () => faker.internet.email());
		const secondPage = times(faker.number.int({ min: 1, max: 5 }), () => faker.internet.email());
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler([]).mockImplementation(
			async (req, res, ctx) => {
				const {
					Body: {
						GetDistributionListMembersRequest: { offset }
					}
				} = await req.json<{
					Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
				}>();
				const result = offset === 0 ? firstPage : secondPage;
				return res(
					ctx.json(
						buildSoapResponse<GetDistributionListMembersResponse>({
							GetDistributionListMembersResponse: {
								_jsns: NAMESPACES.account,
								dlm: result.map((member) => ({ _content: member })),
								more: offset === 0,
								total: firstPage.length + secondPage.length
							}
						})
					)
				);
			}
		);
		const { result } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email]
		});
		await waitFor(() => expect(result.current.members).toStrictEqual(firstPage));
		expect(handler).toHaveBeenCalledTimes(1);
		act(() => {
			result.current.findMore();
		});
		await waitFor(() =>
			expect(result.current.members).toStrictEqual([...firstPage, ...secondPage])
		);
		expect(handler).toHaveBeenCalledTimes(2);
	});

	it('should not request data to network if skip is set to true', async () => {
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler([]);
		const { result } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email, { skip: true }]
		});
		await waitFor(() => expect(result.current.findMore).toBeDefined());
		expect(handler).not.toHaveBeenCalled();
	});

	it('should request data to network when skip becomes false', async () => {
		const members = [faker.internet.email()];
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler(members);
		const { result, rerender } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email, { skip: true }]
		});
		await waitFor(() => expect(result.current.findMore).toBeDefined());
		rerender([dl.email, { skip: false }]);
		await waitFor(() => expect(result.current.members).toStrictEqual(members));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('should reload first page if initial limit is greater than the length of the stored members and there are more members to load', async () => {
		const members = [faker.internet.email()];
		const dl = generateDistributionList({
			members: generateDistributionListMembersPage(members, 10, true)
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const networkMembers = times(10, () => faker.internet.email());
		const handler = registerGetDistributionListMembersHandler(networkMembers);
		const { result } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email, { limit: 10 }]
		});
		await waitFor(() => expect(result.current.members).toStrictEqual(members));
		await waitFor(() => expect(result.current.members).toStrictEqual(networkMembers));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it.each([
		[10, 11],
		[10, 10]
	])(
		'should not reload first page if initial limit (%d) is lower or equal to the length of the stored members (%d) and there are more members to load',
		async (initialLimit, membersLength) => {
			const members = times(membersLength, () => faker.internet.email());
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members, membersLength, true)
			});
			useDistributionListsStore.getState().setDistributionLists([dl]);
			const handler = registerGetDistributionListMembersHandler([]);
			const { result } = setupHook(useGetDistributionListMembers, {
				initialProps: [dl.email, { limit: initialLimit }]
			});
			await waitFor(() => expect(result.current.members).toStrictEqual(members));
			expect(handler).not.toHaveBeenCalled();
		}
	);

	it('should load data from offset when requesting second page', async () => {
		const members = [faker.internet.email()];
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler(members, true);
		const { result } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email, { skip: false }]
		});
		await waitFor(() => expect(result.current.findMore).toBeDefined());
		act(() => {
			result.current.findMore();
		});
		await waitFor(() =>
			expect(handler.mock.lastCall?.[0].body.Body.GetDistributionListMembersRequest.offset).toEqual(
				members.length
			)
		);
	});

	it('should load data from second page if first page is loaded multiple times', async () => {
		const firstPage = times(10, () => faker.internet.email());
		const secondPage = times(10, () => faker.internet.email());
		const dl = generateDistributionList({ members: undefined });
		const handler = registerGetDistributionListMembersHandler([...firstPage, ...secondPage], true);
		const { result, rerender } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email, { skip: false, limit: firstPage.length }]
		});
		await waitFor(() => expect(result.current.members).toStrictEqual(firstPage));
		rerender([dl.email, { skip: true, limit: firstPage.length }]);
		rerender([dl.email, { skip: false, limit: firstPage.length }]);
		await waitFor(() =>
			expect(handler.mock.lastCall?.[0].body.Body.GetDistributionListMembersRequest.offset).toEqual(
				0
			)
		);
		await waitFor(() => expect(result.current.members).toStrictEqual(firstPage));
		act(() => {
			result.current.findMore();
		});
		await waitFor(() =>
			expect(handler.mock.lastCall?.[0].body.Body.GetDistributionListMembersRequest.offset).toEqual(
				firstPage.length
			)
		);
		await waitFor(() =>
			expect(result.current.members).toStrictEqual([...firstPage, ...secondPage])
		);
	});
});
