/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../../api/get-distribution-list-members';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../../constants/api';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { TESTID_SELECTORS } from '../../constants/tests';
import {
	buildSoapResponse,
	registerGetDistributionListHandler,
	registerGetDistributionListMembersHandler
} from '../../tests/msw-handlers';

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
				contactInputOnChange={jest.fn()}
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
				contactInputOnChange={jest.fn()}
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
				contactInputOnChange={jest.fn()}
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
				contactInputOnChange={jest.fn()}
				contactInputValue={[]}
			/>
		);

		const defaultChip = screen.getByTestId('default-chip');
		expect(defaultChip).toBeVisible();
	});
	test('if it is a distribution list it will render the distribution list custom chip', async () => {
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
		const distributionListChip = screen.getByTestId('distribution-list-chip');
		expect(distributionListChip).toBeVisible();
	});

	it('should reload the list of members each time the user clicks on expand action', async () => {
		registerGetDistributionListHandler(distributionList);

		const dlm1 = [{ _content: user1.email }];
		const dlm2 = [{ _content: user2Mail }];

		const handler = registerGetDistributionListMembersHandler();
		handler
			.mockImplementationOnce((req, res, ctx) =>
				res(
					ctx.json(
						buildSoapResponse<GetDistributionListMembersResponse>({
							GetDistributionListMembersResponse: {
								_jsns: NAMESPACES.account,
								dlm: dlm1,
								total: 1,
								more: false
							}
						})
					)
				)
			)
			.mockImplementationOnce((req, res, ctx) =>
				res(
					ctx.json(
						buildSoapResponse<GetDistributionListMembersResponse>({
							GetDistributionListMembersResponse: {
								_jsns: NAMESPACES.account,
								dlm: dlm2,
								total: 1,
								more: false
							}
						})
					)
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

		let chevronExpandAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronExpandAction);
		await screen.findByText(user1.email);

		const chevronCollapseAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.COLLAPSE_DL);
		await user.click(chevronCollapseAction);

		await waitFor(() => {
			expect(screen.queryByText(user1.email)).not.toBeInTheDocument();
		});
		chevronExpandAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronExpandAction);
		expect(handler).toHaveBeenCalledTimes(2);
		expect(await screen.findByText(user2Mail)).toBeVisible();
		expect(screen.queryByText(user1.email)).not.toBeInTheDocument();
	});

	test('the dropdown will contain the select all button and the users list when the chevron action is clicked', async () => {
		const dlm = [user1.email, user2Mail, user3Mail];
		registerGetDistributionListHandler(distributionList);
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

		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronAction);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
		expect(await screen.findByText(user1.email)).toBeVisible();
		expect(screen.getByText(selectAll)).toBeVisible();
		expect(screen.getByText(user2Mail)).toBeVisible();
		expect(screen.getByText(user3Mail)).toBeVisible();
	});

	test.todo(
		'the dropdown will contain a placeholder when the chevron action is clicked and there is no members'
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
			expect(screen.queryByText(selectAll)).not.toBeInTheDocument();
			expect(screen.getByText('PLACEHOLDER')).toBeVisible();
		} */
	);

	test('the dropdown will contain also the show more button when more results can be retrieved', async () => {
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
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);

		await user.click(chevronAction);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
		await screen.findByText(user1.email);

		const showMore = screen.getByText(/show more/i);

		expect(showMore).toBeVisible();
	});

	test('clicking show more button will increase the dropdown items, if all items are retrieved show more will disappear', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];
		const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
		const getMembersHandler = registerGetDistributionListMembersHandler();
		const firstResponse = { dlm, total: 6, more: true };
		const secondResponse = { dlm: dlm2, total: 6, more: false };

		getMembersHandler.mockImplementation(async (req, res, ctx) => {
			const {
				Body: {
					GetDistributionListMembersRequest: { offset }
				}
			} = await req.json<{
				Body: {
					GetDistributionListMembersRequest: GetDistributionListMembersRequest;
				};
			}>();
			let response: Omit<GetDistributionListMembersResponse, '_jsns'>;
			if (offset === undefined || offset === 0) {
				response = firstResponse;
			} else {
				response = secondResponse;
			}
			return res(
				ctx.json(
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: {
							_jsns: NAMESPACES.account,
							...response
						}
					})
				)
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
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronAction);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
		await screen.findByText(user1.email);
		const showMore = screen.getByText(/show more/i);
		await user.click(showMore);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalledTimes(2));
		expect(await screen.findByText(user4Mail)).toBeVisible();
		expect(screen.getByText(user5Mail)).toBeVisible();
		expect(screen.getByText(user6Mail)).toBeVisible();
		expect(showMore).not.toBeInTheDocument();
	});

	test('clicking select all when all data are retrieved, it wont make any other call to the server', async () => {
		const dlm = [user1.email, user2Mail, user3Mail];
		const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
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
		await waitFor(() => expect(getDistributionListHandler).toHaveBeenCalled());
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronAction);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
		await screen.findByText(user1.email);
		const selectAllLabel = screen.getByText(selectAll);
		await user.click(selectAllLabel);
		expect(getMembersHandler).toHaveBeenCalledTimes(1);
	});

	test('clicking select all when more data are available, it will make another call to the server', async () => {
		const dlm = [{ _content: user1.email }, { _content: user2Mail }, { _content: user3Mail }];
		const dlm2 = [{ _content: user4Mail }, { _content: user5Mail }, { _content: user6Mail }];
		const getDistributionListHandler = registerGetDistributionListHandler(distributionList);
		const getMembersHandler = registerGetDistributionListMembersHandler();
		const firstResponse = { dlm, total: 6, more: true };
		const secondResponse = { dlm: dlm2, total: 6, more: false };
		getMembersHandler.mockImplementation(async (req, res, ctx) => {
			const {
				Body: {
					GetDistributionListMembersRequest: { offset }
				}
			} = await req.json<{
				Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
			}>();
			let response: Omit<GetDistributionListMembersResponse, '_jsns'>;
			if (offset === undefined || offset === 0) {
				response = firstResponse;
			} else {
				response = secondResponse;
			}
			return res(
				ctx.json(
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: {
							_jsns: NAMESPACES.account,
							...response
						}
					})
				)
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
		const chevronAction = await screen.findByTestId(TESTID_SELECTORS.ICONS.EXPAND_DL);
		await user.click(chevronAction);
		await waitFor(() => expect(getMembersHandler).toHaveBeenCalled());
		await screen.findByText(user1.email);
		const selectAllLabel = screen.getByText(selectAll);

		await waitFor(() => {
			user.click(selectAllLabel);
		});
		expect(getMembersHandler).toHaveBeenCalledTimes(2);
	});
});
