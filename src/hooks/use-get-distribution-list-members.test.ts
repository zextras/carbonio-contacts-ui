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
		await waitFor(() => expect(result.current.members).toEqual(members));
		expect(result.current.total).toEqual(members.length);
		expect(handler).toHaveBeenCalled();
	});

	it('should not make network request if members are stored', async () => {
		const members = times(faker.number.int({ min: 1, max: 10 }), () => faker.internet.email());
		const dl = generateDistributionList({ members: generateDistributionListMembersPage(members) });
		const handler = registerGetDistributionListMembersHandler(members);
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const { result } = setupHook(useGetDistributionListMembers, { initialProps: [dl.email] });
		await waitFor(() => expect(result.current.members).toEqual(members));
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
		await waitFor(() => expect(result1.current.members).toEqual(members));
		expect(handler).toHaveBeenCalledTimes(1);
		const { result: result2 } = setupHook(useGetDistributionListMembers, {
			initialProps: [dl.email]
		});
		await waitFor(() => expect(result2.current.members).toEqual(members));
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
		await waitFor(() => expect(result.current.members).toEqual(firstPage));
		expect(handler).toHaveBeenCalledTimes(1);
		act(() => {
			result.current.findMore();
		});
		await waitFor(() => expect(result.current.members).toEqual([...firstPage, ...secondPage]));
		expect(handler).toHaveBeenCalledTimes(2);
	});
});
