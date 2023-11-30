/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { getDistributionListCustomResponse } from '../tests/msw/handle-get-distribution-list-members-request';

const getDistributionListMembersRequest = '/service/soap/GetDistributionListMembersRequest';

const dl1Id = 'dl-1';
const dl1Label = 'dl 1';
const dl1Mail = 'dl1@mail.com';

const user1Mail = 'user1@mail.com';
const user2Mail = 'user2@mail.com';
const user3Mail = 'user3@mail.com';
const user4Mail = 'user4@mail.com';
const user5Mail = 'user5@mail.com';
const user6Mail = 'user6@mail.com';

const chevronTestId = 'icon: ChevronDownOutline';

const selectAll = 'Select address';

describe('Contact input custom chip component', () => {
	test('if it is a group it will render a normal chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={'group-1'}
				label={'group 1'}
				email={''}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId('default-chip');
		expect(defaultChip).toBeInTheDocument();
	});
	test('if it is a contact it will render a normal chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={'user-1'}
				label={'user 1'}
				email={user1Mail}
				isGroup={false}
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId('default-chip');
		expect(defaultChip).toBeInTheDocument();
	});
	test('if it is a distribution list it will render the distribution list custom chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const distributionListChip = screen.getByTestId('distribution-list-chip');
		expect(distributionListChip).toBeInTheDocument();
	});
	test('the dropdown will contain the select all button and the users list when the chevron action is clicked', async () => {
		const dlm = [{ _content: user1Mail }, { _content: user2Mail }, { _content: user3Mail }];
		const total = 3;
		const more = false;
		const response = getDistributionListCustomResponse({ dlm, total, more });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = screen.getByTestId(chevronTestId);

		await waitFor(() => {
			user.click(chevronAction);
		});

		const selectAllLabel = screen.getByText(selectAll);
		const user1 = screen.getByText(user1Mail);
		const user2 = screen.getByText(user2Mail);
		const user3 = screen.getByText(user3Mail);

		expect(selectAllLabel).toBeInTheDocument();
		expect(user1).toBeInTheDocument();
		expect(user2).toBeInTheDocument();
		expect(user3).toBeInTheDocument();
	});
	test('the dropdown will contain also the show more button when more results can be retrieved', async () => {
		const dlm = [{ _content: user1Mail }, { _content: user2Mail }, { _content: user3Mail }];
		const total = 6;
		const more = true;
		const response = getDistributionListCustomResponse({ dlm, total, more });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = screen.getByTestId(chevronTestId);

		await waitFor(() => {
			user.click(chevronAction);
		});
		jest.advanceTimersByTime(600);

		const showMore = screen.getByText(/show more/i);

		expect(showMore).toBeInTheDocument();
	});
	test('clicking show more button will increase the dropdown items, if all items are retrieved show more will disappear', async () => {
		const dlm = [{ _content: user1Mail }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];

		const firstResponse = getDistributionListCustomResponse({ dlm, total: 6, more: true });
		const secondResponse = getDistributionListCustomResponse({ dlm: dlm2, total: 6, more: false });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
				res(ctx.json(firstResponse))
			)
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = screen.getByTestId(chevronTestId);

		await waitFor(() => {
			user.click(chevronAction);
		});

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
				res(ctx.json(secondResponse))
			)
		);

		const showMore = screen.getByText(/show more/i);

		await waitFor(() => {
			user.click(showMore);
		});

		const user4 = screen.getByText(user4Mail);
		const user5 = screen.getByText(user5Mail);
		const user6 = screen.getByText(user6Mail);

		expect(user4).toBeInTheDocument();
		expect(user5).toBeInTheDocument();
		expect(user6).toBeInTheDocument();

		expect(showMore).not.toBeInTheDocument();
	});
	test('clicking select all when all data are retrieved, it wont make any other call to the server', async () => {
		const dlm = [{ _content: user1Mail }, { _content: user2Mail }, { _content: user3Mail }];
		const response = getDistributionListCustomResponse({ dlm, total: 3, more: false });
		const dispatchRequest = jest.fn();

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);
		getSetupServer().events.on('request:start', dispatchRequest);
		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = screen.getByTestId(chevronTestId);

		await waitFor(() => {
			user.click(chevronAction);
		});

		const selectAllLabel = screen.getByText(selectAll);

		await waitFor(() => {
			user.click(selectAllLabel);
		});
		expect(dispatchRequest).toHaveBeenCalledTimes(1);
	});
	test('clicking select all when more data are available, it will make another call to the server', async () => {
		const dlm = [{ _content: user1Mail }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];
		const firstResponse = getDistributionListCustomResponse({ dlm, total: 6, more: true });
		const secondResponse = getDistributionListCustomResponse({ dlm: dlm2, total: 6, more: false });
		const dispatchRequest = jest.fn();

		getSetupServer().events.on('request:start', (request) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (request.body?.Body?.GetDistributionListMembersRequest) {
				return dispatchRequest();
			}
			return undefined;
		});

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
				res(ctx.json(firstResponse))
			)
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={dl1Id}
				label={dl1Label}
				email={dl1Mail}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = screen.getByTestId(chevronTestId);

		await waitFor(() => {
			user.click(chevronAction);
		});

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
				res(ctx.json(secondResponse))
			)
		);

		const selectAllLabel = screen.getByText(selectAll);

		await waitFor(() => {
			user.click(selectAllLabel);
		});
		expect(dispatchRequest).toHaveBeenCalledTimes(2);
	});

	describe('Editing DL', () => {
		it("doesn't show the edit icon if the contact isn't a DL", () => {
			setupTest(
				<ContactInputCustomChipComponent
					id={'user-1'}
					label={'user 1'}
					email={user1Mail}
					isGroup={false}
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			const editButton = screen.queryByRoleWithIcon('button', { icon: 'edit-2-outline' });
			expect(editButton).not.toBeInTheDocument();
		});

		it('shows the edit icon if the contact is a DL', () => {
			setupTest(
				<ContactInputCustomChipComponent
					id={'user-1'}
					label={'user 1'}
					email={user1Mail}
					isGroup
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			const editButton = screen.queryByRoleWithIcon('button', { icon: 'edit-2-outline' });
			expect(editButton).toBeInTheDocument();
		});

		it.todo(
			"doesn't show the edit icon if the contacts is a DL and if the current user is not the DL owner"
		);

		it.todo('shows the edit icon if the contact is a DL but the current user is the DL owner');

		it.todo(
			'if the user click on the edit icon the DL description is displayed inside a modal modal'
		);
	});
});
