/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';
import { HttpResponse } from 'msw';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { DL_MEMBERS_LOAD_LIMIT } from '../../constants';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { TESTID_SELECTORS, TIMERS } from '../../constants/tests';
import { DistributionList } from '../../model/distribution-list';
import { GetDistributionListMembersResponse } from '../../network/api/get-distribution-list-members';
import { useDistributionListsStore } from '../../store/distribution-lists';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { registerGetDistributionListMembersHandler } from '../../tests/msw-handlers/get-distribution-list-members';
import {
	buildSoapResponse,
	generateDistributionList,
	generateDistributionListMembersPage
} from '../../tests/utils';

const distributionList = generateDistributionList({
	id: 'dl-1',
	email: 'dl1@mail.com',
	displayName: 'dl 1',
	owners: [{ id: mockedAccount.id, name: mockedAccount.name }],
	isOwner: true
});

const user1 = {
	id: 'user1ID',
	email: 'user1@mail.com',
	label: 'user1'
};

const user2Mail = 'user2@mail.com';
const user3Mail = 'user3@mail.com';
const user4Mail = 'user4@mail.com';
const user5Mail = 'user5@mail.com';
const user6Mail = 'user6@mail.com';

const selectAll = /Select address|Select all \d+ addresses/;

describe('Contact input custom chip component', () => {
	test('if chipDisplayName is not passed it will show chips label by default', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={user1.label}
				email={user1.email}
				isGroup={false}
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
			/>
		);
		const defaultChipLabel = screen.getByText(user1.label);

		expect(defaultChipLabel).toBeVisible();
	});
	test('if chipDisplayName has label value it will show chips label', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={user1.label}
				email={user1.email}
				isGroup={false}
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.label}
			/>
		);
		const defaultChipLabel = screen.getByText(user1.label);

		expect(defaultChipLabel).toBeVisible();
	});
	test('if chipDisplayName has email value it will show chips email', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={user1.label}
				email={user1.email}
				isGroup={false}
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.email}
			/>
		);
		const defaultChipEmail = screen.getByText(user1.email);

		expect(defaultChipEmail).toBeVisible();
	});

	it('should show email if the label is empty', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={''}
				email={user1.email}
				isGroup={false}
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.email}
			/>
		);
		expect(screen.getByText(user1.email)).toBeVisible();
	});

	test('if it is a group it will render a normal chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={'group-1'}
				label={'group 1'}
				email={''}
				isGroup
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId(TESTID_SELECTORS.contactInputChip);
		expect(defaultChip).toBeVisible();
	});
	test('if it is a contact it will render a normal chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={user1.label}
				email={user1.email}
				isGroup={false}
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId(TESTID_SELECTORS.contactInputChip);
		expect(defaultChip).toBeVisible();
	});

	it('should show the distribution list custom chip if contact is a distribution list', async () => {
		const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
		setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
		const distributionListChip = screen.getByTestId(TESTID_SELECTORS.dlChip);
		expect(distributionListChip).toBeVisible();
	});

	describe('Distribution list expand members action', () => {
		it('should request the list of members only the first time the user clicks on expand action and distribution list is stored without members', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			const getMemberHandler = registerGetDistributionListMembersHandler([user1.email]);
			useDistributionListsStore.getState().setDistributionLists([distributionList]);
			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMemberHandler).toHaveBeenCalledTimes(1));
			await screen.findByText(user1.email);
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.collapseDL })
			);
			await waitFor(() => expect(screen.queryByText(user1.email)).not.toBeInTheDocument());
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(user1.email);
			expect(getMemberHandler).toHaveBeenCalledTimes(1);
		});

		it('should request the list of members each time if the user clicks on expand action and distribution list is not stored', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler([user1.email]);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());

			await act(async () => {
				await user.click(
					await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
				);
			});

			await act(async () => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});

			expect(getMembersHandler).toHaveBeenCalledTimes(1);
			await screen.findByText(user1.email);
			await act(async () => {
				await user.click(
					await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.collapseDL })
				);
			});
			await waitFor(() => expect(screen.queryByText(user1.email)).not.toBeInTheDocument());
			await act(async () => {
				await user.click(
					await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
				);
			});
			await act(async () => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalledTimes(2));
			await screen.findByText(user1.email);
		});

		it('should show the select all action', async () => {
			const dlm = [user1.email, user2Mail, user3Mail];
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);
			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(user1.email);
			expect(getMembersHandler).toHaveBeenCalled();
			expect(screen.getByRole('button', { name: selectAll })).toBeVisible();
		});

		it.todo(
			'IRIS-4949 should show a placeholder when there is no member'
			/* async () => {
				registerGetDistributionListHandler(distributionList);
				const response = getDistributionListCustomResponse({ dlm: [], total: 0, more: false });

				getSetupServer().use(
					rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
						res(ctx.json(response))
					)
				);

				const { user } = setupTest(
					<ContactInputCustomChipComponent
						id={distributionList.id}
						label={distributionList.displayName}
						email={distributionList.email}
						isGroup
						contactInputOnChange={jest.fn()}
						contactInputValue={[]}
					/>
				);

				const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

				await user.click(chevronAction);

				await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
				expect(screen.queryByRole('button', { name: selectAll })).not.toBeInTheDocument();
				expect(screen.getByText('PLACEHOLDER')).toBeVisible();
			} */
		);

		it('should show the "show more" action when there are more members to load', async () => {
			const dlm = [user1.email, user2Mail, user3Mail];
			const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm, true);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', {
					icon: TESTID_SELECTORS.icons.expandDL
				})
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.email);
			expect(screen.getByRole('button', { name: /show more/i })).toBeVisible();
		});

		it('should not show "show more" action when there are no more members to load', async () => {
			const dlm = [user1.email, user2Mail, user3Mail];
			const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm, false);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', {
					icon: TESTID_SELECTORS.icons.expandDL
				})
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.email);
			expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
		});

		it('should load more members on "show more" action', async () => {
			const firstPage = [
				{ _content: user1.email },
				{ _content: user2Mail },
				{ _content: user3Mail }
			];
			const secondPage = [
				{ _content: user4Mail },
				{ _content: user5Mail },
				{ _content: user6Mail }
			];
			const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
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
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
			const chevronAction = await screen.findByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.expandDL
			});
			await user.click(chevronAction);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.email);
			expect(screen.queryByText(user4Mail)).not.toBeInTheDocument();
			const showMore = screen.getByText(/show more/i);
			await user.click(showMore);
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalledTimes(2));
			expect(await screen.findByText(user4Mail)).toBeVisible();
			expect(screen.getByText(user5Mail)).toBeVisible();
			expect(screen.getByText(user6Mail)).toBeVisible();
			expect(showMore).not.toBeInTheDocument();
		});

		it('should not request more data to the server on "select all" if all members are loaded', async () => {
			const dlm = [user1.email, user2Mail, user3Mail];
			const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(dlm);
			const contactInputOnChangeFn = jest.fn();
			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={contactInputOnChangeFn}
					contactInputValue={[]}
				/>
			);
			await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', {
					icon: TESTID_SELECTORS.icons.expandDL
				})
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.email);
			await user.click(screen.getByRole('button', { name: selectAll }));
			await waitFor(() => expect(contactInputOnChangeFn).toHaveBeenCalled());
			expect(getMembersHandler).toHaveBeenCalledTimes(1);
		});

		it('should request all members to the network on "select all" if not all members are loaded yet', async () => {
			const dlm = [user1.email, user2Mail, user3Mail];
			const dlm2 = [user4Mail, user5Mail, user6Mail];
			const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler();
			const firstResponse = { dlm: dlm.map((m) => ({ _content: m })), total: 6, more: true };
			const secondResponse = { dlm: dlm2.map((m) => ({ _content: m })), total: 6, more: false };
			getMembersHandler.mockImplementation(async ({ request }) => {
				const {
					Body: {
						GetDistributionListMembersRequest: { offset }
					}
				} = await request.json();
				let response: Omit<GetDistributionListMembersResponse, '_jsns'>;
				if (offset === undefined || offset === 0) {
					response = firstResponse;
				} else {
					response = secondResponse;
				}
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
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={contactInputOnChangeFn}
					contactInputValue={[]}
				/>
			);
			await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
			await screen.findByText(user1.email);
			await user.click(screen.getByRole('button', { name: selectAll }));
			await waitFor(() =>
				expect(contactInputOnChangeFn).toHaveBeenCalledWith(
					[...dlm, ...dlm2].map((m) => ({
						email: m,
						id: m,
						label: m,
						value: m
					}))
				)
			);
			expect(getMembersHandler).toHaveBeenCalledTimes(2);
		});

		it('should not request data to the network if at least first page is already stored', async () => {
			const members = times(DL_MEMBERS_LOAD_LIMIT, () => faker.internet.email());
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(members);
			useDistributionListsStore.getState().setDistributionLists([
				{
					...distributionList,
					members: { members, total: DL_MEMBERS_LOAD_LIMIT * 2, more: true }
				}
			]);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);
			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());
			await user.click(
				await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			);
			act(() => {
				jest.advanceTimersByTime(TIMERS.dropdown.registerListeners);
			});
			await screen.findByText(members[0]);
			expect(getMembersHandler).not.toHaveBeenCalled();
		});

		it('should request data to the network on "show more" if there are members already stored', async () => {
			const members = [user1.email, user2Mail, user3Mail];
			const secondPage = [faker.internet.email()];
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			const getMembersHandler = registerGetDistributionListMembersHandler(secondPage);
			useDistributionListsStore
				.getState()
				.setDistributionLists([
					{ ...distributionList, members: { members, total: 10, more: true } }
				]);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);
			const expandButton = await screen.findByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.expandDL
			});
			await act(async () => {
				await user.click(expandButton);
			});

			const selectAllButton = await screen.findByRole('button', { name: selectAll });
			await act(async () => {
				await user.click(selectAllButton);
			});
			expect(getDLHandler).toHaveBeenCalledTimes(1);
			expect(getMembersHandler).toHaveBeenCalledTimes(1);
		});

		it('should request distribution list data to the network if it is not stored', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);
			await waitFor(() => expect(getDLHandler).toHaveBeenCalled());
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL });
		});

		it('should not request distribution list data to the network if it is already stored', async () => {
			const getDLHandler = registerGetDistributionListHandler(distributionList);
			useDistributionListsStore.getState().setDistributionLists([
				{
					description: '',
					isOwner: true,
					isMember: true,
					owners: [],
					members: generateDistributionListMembersPage([]),
					...distributionList
				} satisfies Required<DistributionList>
			]);
			setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					contactInputOnChange={jest.fn()}
					contactInputValue={[]}
				/>
			);
			await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL });
			expect(getDLHandler).not.toHaveBeenCalled();
		});
	});
});
