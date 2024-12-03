/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';
import { HttpResponse } from 'msw';

import { DistributionListChip } from './distribution-list-chip';
import { clickCollapseDL, clickExpandDL, SELECT_ALL, SHOW_MORE } from './test/mocks';
import { USER_TYPES } from './types';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { DL_MEMBERS_LOAD_LIMIT } from '../../constants';
import { TESTID_SELECTORS, TIMERS } from '../../constants/tests';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { GetDistributionListMembersResponse } from '../../network/api/get-distribution-list-members';
import { useDistributionListsStore } from '../../store/distribution-lists';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { registerGetDistributionListMembersHandler } from '../../tests/msw-handlers/get-distribution-list-members';
import {
	buildSoapError,
	buildSoapResponse,
	generateDistributionList,
	generateDistributionListMembersPage
} from '../../tests/utils';

const id = 'dl-1';
const email = 'dl1@mail.com';
const distributionList = generateDistributionList({
	id,
	email,
	displayName: 'dl 1',
	owners: [{ id: mockedAccount.id, name: mockedAccount.name }],
	isOwner: true
});

const distributionListChip = {
	id,
	label: email,
	value: {
		id,
		email,
		type: USER_TYPES.DISTRIBUTION_LIST
	}
};
const user1 = {
	id: 'user1ID',
	label: 'user1',
	value: {
		id: 'user1ID',
		email: 'user1@mail.com',
		type: USER_TYPES.CONTACT
	}
};

describe('Distribution ListChip', () => {
	describe('expand members action', () => {
		it('should request the list of members only the first time the user clicks on expand action and distribution list is stored correctly', async () => {
			const getMemberHandler = registerGetDistributionListMembersHandler([user1.value.email]);
			const getDLInterceptor = createSoapAPIInterceptor<
				GetDistributionListRequest,
				GetDistributionListResponse
			>('GetDistributionList', {
				_jsns: 'urn:zimbraAccount',
				dl: [{ id: distributionListChip.id, name: distributionListChip.value.email }],
				requestId: ''
			});
			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await getDLInterceptor;
			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMemberHandler).toHaveBeenCalledTimes(1));
			await screen.findByText(user1.value.email);

			await clickCollapseDL(user);
			await waitFor(() => expect(screen.queryByText(user1.value.email)).not.toBeInTheDocument());

			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(user1.value.email);
			expect(getMemberHandler).toHaveBeenCalledTimes(1);
		});

		it('should request the list of members each time if the user clicks on expand action and distribution list is not stored', async () => {
			const getDLErrorInterceptor = createSoapAPIInterceptor(
				'GetDistributionList',
				buildSoapError('error')
			);
			const getMembersHandler = registerGetDistributionListMembersHandler([user1.value.email]);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await getDLErrorInterceptor;

			await clickExpandDL(user);
			await act(async () => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			expect(getMembersHandler).toHaveBeenCalledTimes(1);
			await screen.findByText(user1.value.email);

			await clickCollapseDL(user);
			await waitFor(() => expect(screen.queryByText(user1.value.email)).not.toBeInTheDocument());

			await clickExpandDL(user);
			await act(async () => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalledTimes(2));
			await screen.findByText(user1.value.email);
		});

		it('should show the select all action', async () => {
			const dlm = [user1.value.email, 'other@test.com', 'another@test.com'];
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await clickExpandDL(user);

			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(user1.value.email);
			expect(getMembersHandler).toHaveBeenCalled();
			expect(screen.getByRole('button', { name: SELECT_ALL })).toBeVisible();
		});

		it('should show the "show more" action when there are more members to load', async () => {
			const dlm = [user1.value.email, 'other@test.com', 'another@test.com'];
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm, true);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);

			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.value.email);
			expect(screen.getByRole('button', { name: SHOW_MORE })).toBeVisible();
		});

		it('should not show "show more" action when there are no more members to load', async () => {
			const dlm = [user1.value.email, 'other@test.com', 'another@test.com'];
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm, false);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.value.email);
			expect(screen.queryByRole('button', { name: SHOW_MORE })).not.toBeInTheDocument();
		});

		it('should load more members on "show more" action', async () => {
			const firstPage = [
				{ _content: user1.value.email },
				{ _content: 'other@test.com' },
				{ _content: 'another@test.com' }
			];
			const userInSecondTranche = 'another2@test.com';
			const secondTrancheUser2 = 'another3@test.com';
			const secondTrancheUser3 = 'another4@test.com';
			const secondPage = [
				{ _content: userInSecondTranche },
				{ _content: secondTrancheUser2 },
				{ _content: secondTrancheUser3 }
			];
			const getMembersHandler = registerGetDistributionListMembersHandler([]);
			const firstResponse = { dlm: firstPage, total: 6, more: true };
			const secondResponse = { dlm: secondPage, total: 6, more: false };

			getMembersHandler.mockImplementation(async ({ request }) => {
				const {
					Body: {
						GetDistributionListMembersRequest: { offset }
					}
				} = await request.json();
				const response = offset === undefined || offset === 0 ? firstResponse : secondResponse;
				return HttpResponse.json(
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: {
							_jsns: JSNS.account,
							...response
						}
					})
				);
			});

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);

			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.value.email);
			expect(screen.queryByText(userInSecondTranche)).not.toBeInTheDocument();

			const showMore = screen.getByText(SHOW_MORE);
			await user.click(showMore);
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalledTimes(2));
			expect(await screen.findByText(userInSecondTranche)).toBeVisible();
			expect(screen.getByText(secondTrancheUser2)).toBeVisible();
			expect(screen.getByText(secondTrancheUser3)).toBeVisible();
			expect(showMore).not.toBeInTheDocument();
		});

		it('should not request more data to the server on "select all" if all members are loaded', async () => {
			const dlm = [user1.value.email, 'other@test.com', 'another@test.com'];
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm);
			const contactInputOnChangeFn = jest.fn();

			const { user } = setupTest(
				<DistributionListChip onExpandDL={contactInputOnChangeFn} {...distributionListChip} />
			);
			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.value.email);
			await user.click(screen.getByRole('button', { name: SELECT_ALL }));
			await waitFor(() => expect(contactInputOnChangeFn).toHaveBeenCalled());
			expect(getMembersHandler).toHaveBeenCalledTimes(1);
		});

		it('should request all members to the network on "select all" if not all members are loaded yet', async () => {
			const members1 = [user1.value.email, 'other@test.com', 'another@test.com'];
			const members2 = ['another2@test.com', 'another3@test.com', 'another4@test.com'];
			const getMembersHandler = registerGetDistributionListMembersHandler();
			const firstResponse = { dlm: members1.map((m) => ({ _content: m })), total: 6, more: true };
			const secondResponse = { dlm: members2.map((m) => ({ _content: m })), total: 6, more: false };
			getMembersHandler.mockImplementation(async ({ request }) => {
				const {
					Body: {
						GetDistributionListMembersRequest: { offset }
					}
				} = await request.json();
				const response = offset === undefined || offset === 0 ? firstResponse : secondResponse;
				return HttpResponse.json(
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: {
							_jsns: JSNS.account,
							...response
						}
					})
				);
			});

			const contactInputOnChangeFn = jest.fn();
			const { user } = setupTest(
				<DistributionListChip onExpandDL={contactInputOnChangeFn} {...distributionListChip} />
			);
			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.value.email);
			await user.click(screen.getByRole('button', { name: SELECT_ALL }));
			await waitFor(() =>
				expect(contactInputOnChangeFn).toHaveBeenCalledWith(distributionListChip.value, [
					...members1,
					...members2
				])
			);
			expect(getMembersHandler).toHaveBeenCalledTimes(2);
		});

		it('should not request data to the network if at least first page/batch of results is already stored', async () => {
			const members = times(DL_MEMBERS_LOAD_LIMIT, () => faker.internet.email());
			const getMembersHandler = registerGetDistributionListMembersHandler(members);
			useDistributionListsStore.getState().setDistributionLists([
				{
					...distributionList,
					description: 'Test',
					members: { members, total: DL_MEMBERS_LOAD_LIMIT * 2, more: true }
				}
			]);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await clickExpandDL(user);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(members[0]);
			expect(getMembersHandler).not.toHaveBeenCalled();
		});

		it('should request data to the network on "show more" if there are members already stored', async () => {
			const members = times(DL_MEMBERS_LOAD_LIMIT, () => faker.internet.email());
			const secondPage = [faker.internet.email()];
			const getMembersHandler = registerGetDistributionListMembersHandler(secondPage);

			useDistributionListsStore.getState().setDistributionLists([
				{
					...distributionList,
					description: '',
					isOwner: true,
					isMember: true,
					owners: [],
					members: { members, total: DL_MEMBERS_LOAD_LIMIT + 1, more: true }
				}
			]);

			const { user } = setupTest(
				<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />
			);
			await clickExpandDL(user);

			const selectAllButton = await screen.findByRole('button', { name: SHOW_MORE });
			await act(async () => {
				await user.click(selectAllButton);
			});
			expect(getMembersHandler).toHaveBeenCalledTimes(1);
		});

		it('should request distribution list data to the network if it is not stored', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			setupTest(<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />);
			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL });
		});

		it('should not request distribution list data to the network if it is already stored with correct data: id, displayName, owners. description, isMember, isOwner', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			useDistributionListsStore.getState().setDistributionLists([
				{
					description: '',
					isOwner: true,
					isMember: true,
					owners: [],
					members: generateDistributionListMembersPage([]),
					...distributionList
				}
			]);
			setupTest(<DistributionListChip onExpandDL={jest.fn()} {...distributionListChip} />);
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL });
			expect(getDLHandler).not.toHaveBeenCalled();
		});
	});
});
