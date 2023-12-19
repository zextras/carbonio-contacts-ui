/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { TESTID_SELECTORS, TIMERS } from '../../constants/tests';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers';
import { generateStore } from '../tests/generators/store';
import { getDistributionListCustomResponse } from '../tests/msw/handle-get-distribution-list-members-request';

const getDistributionListMembersRequest = '/service/soap/GetDistributionListMembersRequest';

const distributionList = {
	id: 'dl-1',
	email: 'dl1@mail.com',
	displayName: 'dl 1',
	owners: [{ id: mockedAccount.id, name: mockedAccount.name }]
};

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
				_onChange={jest.fn()}
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
				_onChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.LABEL}
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
				_onChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.EMAIL}
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
				_onChange={jest.fn()}
				contactInputValue={[]}
				chipDisplayName={CHIP_DISPLAY_NAME_VALUES.EMAIL}
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
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId('default-chip');
		expect(defaultChip).toBeVisible();
	});
	test('if it is a contact it will render a normal chip', () => {
		setupTest(
			<ContactInputCustomChipComponent
				id={user1.id}
				label={user1.label}
				email={user1.email}
				isGroup={false}
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId('default-chip');
		expect(defaultChip).toBeVisible();
	});
	test('if it is a distribution list it will render the distribution list custom chip', async () => {
		const handler = registerGetDistributionListHandler(distributionList);
		setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		await waitFor(() => expect(handler).toHaveBeenCalled());
		const distributionListChip = screen.getByTestId('distribution-list-chip');
		expect(distributionListChip).toBeVisible();
	});
	test('the dropdown will contain the select all button and the users list when the chevron action is clicked', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const total = 3;
		const more = false;
		registerGetDistributionListHandler(distributionList);
		const response = getDistributionListCustomResponse({ dlm, total, more });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

		await waitFor(() => {
			user.click(chevronAction);
		});

		const selectAllLabel = screen.getByText(selectAll);
		const user1Element = screen.getByText(user1.email);
		const user2Element = screen.getByText(user2Mail);
		const user3Element = screen.getByText(user3Mail);

		expect(selectAllLabel).toBeVisible();
		expect(user1Element).toBeVisible();
		expect(user2Element).toBeVisible();
		expect(user3Element).toBeVisible();
	});

	test('the dropdown will contain a placeholder when the chevron action is clicked and there is no members', async () => {
		registerGetDistributionListHandler(distributionList);
		const response = getDistributionListCustomResponse({ dlm: [], total: 0, more: false });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

		await user.click(chevronAction);

		await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
		expect(screen.queryByText(selectAll)).not.toBeInTheDocument();
		expect(screen.getByText('PLACEHOLDER')).toBeVisible();
	});

	test('the dropdown will contain also the show more button when more results can be retrieved', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const total = 6;
		const more = true;
		const handler = registerGetDistributionListHandler(distributionList);
		const response = getDistributionListCustomResponse({ dlm, total, more });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => res(ctx.json(response)))
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		await waitFor(() => expect(handler).toHaveBeenCalled());
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

		await user.click(chevronAction);
		await screen.findByText(user1.email);

		const showMore = screen.getByText(/show more/i);

		expect(showMore).toBeVisible();
	});
	test('clicking show more button will increase the dropdown items, if all items are retrieved show more will disappear', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];
		const handler = registerGetDistributionListHandler(distributionList);
		const firstResponse = getDistributionListCustomResponse({ dlm, total: 6, more: true });
		const secondResponse = getDistributionListCustomResponse({ dlm: dlm2, total: 6, more: false });

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) =>
				res(ctx.json(firstResponse))
			)
		);

		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		await waitFor(() => expect(handler).toHaveBeenCalled());
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

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

		expect(user4).toBeVisible();
		expect(user5).toBeVisible();
		expect(user6).toBeVisible();

		expect(showMore).not.toBeInTheDocument();
	});
	test('clicking select all when all data are retrieved, it wont make any other call to the server', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const handler = registerGetDistributionListHandler(distributionList);
		const response = getDistributionListCustomResponse({ dlm, total: 3, more: false });
		const dispatchRequest = jest.fn();

		getSetupServer().use(
			rest.post(getDistributionListMembersRequest, async (req, res, ctx) => {
				dispatchRequest();
				return res(ctx.json(response));
			})
		);
		const { user } = setupTest(
			<ContactInputCustomChipComponent
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);
		await waitFor(() => expect(handler).toHaveBeenCalled());
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

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
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];
		const handler = registerGetDistributionListHandler(distributionList);
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
				id={distributionList.id}
				label={distributionList.displayName}
				email={distributionList.email}
				isGroup
				_onChange={jest.fn()}
				contactInputValue={[]}
			/>
		);
		await waitFor(() => expect(handler).toHaveBeenCalled());
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

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
			const handler = registerGetDistributionListHandler(distributionList);

			setupTest(
				<ContactInputCustomChipComponent
					id={'user-1'}
					label={'user 1'}
					email={user1.email}
					isGroup={false}
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			const editButton = screen.queryByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.EDIT_DL
			});
			expect(editButton).not.toBeInTheDocument();
			expect(handler).not.toHaveBeenCalled();
		});

		it('should not show the edit icon if the contact is a DL but the current user is not the DL owner', async () => {
			distributionList.owners = [{ id: faker.string.uuid(), name: faker.person.fullName() }];

			const handler = registerGetDistributionListHandler(distributionList);

			setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(handler).toHaveBeenCalled());
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.EDIT_DL })
			).not.toBeInTheDocument();
		});

		it('should show the edit icon if the contact is a DL and the current user is the DL owner', async () => {
			distributionList.owners = [{ id: mockedAccount.id, name: mockedAccount.name }];

			const handler = registerGetDistributionListHandler(distributionList);

			setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>
			);

			await waitFor(() => expect(handler).toHaveBeenCalled());
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.EDIT_DL })
			).toBeVisible();
		});

		it('if the user clicks on the edit icon the DL title is displayed inside a modal', async () => {
			const store = generateStore();

			const handler = registerGetDistributionListHandler(distributionList);

			const { user } = setupTest(
				<ContactInputCustomChipComponent
					id={distributionList.id}
					label={distributionList.displayName}
					email={distributionList.email}
					isGroup
					_onChange={jest.fn()}
					contactInputValue={[]}
				/>,
				{ store }
			);

			await waitFor(() => expect(handler).toHaveBeenCalled());
			const editButton = await screen.findByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.EDIT_DL
			});
			await user.click(editButton);
			await screen.findByText(`Edit "${distributionList.displayName}"`);
			act(() => {
				jest.advanceTimersByTime(TIMERS.MODAL.DELAY_OPEN);
			});
			expect(
				within(screen.getByTestId(TESTID_SELECTORS.MODAL)).getByText(
					`Edit "${distributionList.displayName}"`
				)
			).toBeVisible();
		});
	});
});
