/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';
import { rest } from 'msw';

import { EditDLControllerComponent, EditDLControllerComponentProps } from './edit-dl-controller';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../api/get-distribution-list-members';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import { setupTest, screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';
import { NAMESPACES } from '../constants/api';

const buildSoapResponse = <T,>(responseData: Record<string, T>): SoapResponse<T> => ({
	Header: {
		context: {}
	},
	Body: responseData
});

const registerGetDistributionListMembersHandler = (members: Array<string>): void => {
	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
			never,
			SoapResponse<GetDistributionListMembersResponse>
		>('/service/soap/GetDistributionListMembersRequest', async (req, res, ctx) => {
			const reqBody = await req.json<{
				Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
			}>();
			const { limit } = reqBody.Body.GetDistributionListMembersRequest;
			if (limit !== undefined && limit > 0) {
				throw new Error('expected limit to be undefined or 0 to load all members');
			}
			return res(
				ctx.json(
					buildSoapResponse({
						GetDistributionListMembersResponse: {
							dlm: members.map((member) => ({ _content: member })),
							more: false,
							total: members.length,
							_jsns: NAMESPACES.account
						}
					})
				)
			);
		})
	);
};

const registerDistributionListActionHandler = (action: DistributionListActionOperation, members: Array<string>): void => {
	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
			never,
			SoapResponse<GetDistributionListMembersResponse>
		>('/service/soap/DistributionListActionRequest', async (req, res, ctx) => {
			const reqBody = await req.json<{
				Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
			}>();
			const { limit } = reqBody.Body.GetDistributionListMembersRequest;
			if (limit !== undefined && limit > 0) {
				throw new Error('expected limit to be undefined or 0 to load all members');
			}
			return res(
				ctx.json(
					buildSoapResponse({
						GetDistributionListMembersResponse: {
							dlm: members.map((member) => ({ _content: member })),
							more: false,
							total: members.length,
							_jsns: NAMESPACES.account
						}
					})
				)
			);
		})
	);
};

const buildProps = ({
	email = '',
	onClose = jest.fn(),
	onSave = jest.fn()
}: Partial<EditDLControllerComponentProps> = {}): EditDLControllerComponentProps => ({
	email,
	onClose,
	onSave
});

describe('EditDLControllerComponent', () => {
	it('should render an EditDLComponent that displays the DL email', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const store = generateStore();
		registerGetDistributionListMembersHandler([]);
		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, { store });
		expect(await screen.findByText(dlEmail)).toBeVisible();
	});

	it('should load all members on first load', async () => {
		const store = generateStore();
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, { store });
		await screen.findByText(dlEmail);
		await screen.findByText(`Member list ${members.length}`);
		expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(members.length);
	});

	it('should add all valid emails inside the list when user clicks on add action', async () => {
		const store = generateStore();
		const dlEmail = 'dl-mail@domain.net';
		registerGetDistributionListMembersHandler([]);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, {
			store
		});
		const emails = ['john.doe@test.com', 'invalid-email.com', 'mary.white@example.org'];
		await act(async () => {
			await user.type(
				screen.getByRole('textbox', { name: /insert an address/i }),
				emails.join(',')
			);
		});
		await user.click(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
		);
		const memberElements = await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
		expect(memberElements).toHaveLength(2);
		expect(screen.getByText(emails[0])).toBeVisible();
		expect(screen.getByText(emails[2])).toBeVisible();
	});

	it('should add new members on top of the list of members', async () => {
		const store = generateStore();
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, {
			store
		});
		const emails = ['john.doe@test.com', 'mary.white@example.org'];
		await screen.findByText(dlEmail);
		await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
		await act(async () => {
			await user.type(
				screen.getByRole('textbox', { name: /insert an address/i }),
				emails.join(',')
			);
		});
		await user.click(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
		);
		const memberElements = screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
		expect(memberElements).toHaveLength(12);
		expect(within(memberElements[0]).getByText(emails[0])).toBeVisible();
		expect(within(memberElements[1]).getByText(emails[1])).toBeVisible();
		expect(within(memberElements[2]).getByText(members[0])).toBeVisible();
	});

	it('should remove a member from the members list when the user clicks on the remove button', async () => {
		const store = generateStore();
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, {
			store
		});
		await screen.findByText(dlEmail);
		const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
		const memberToRemoveElement = membersListItems.find(
			(element) => within(element).queryByText(members[4]) !== null
		) as HTMLElement;
		await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
		expect(screen.queryByText(members[4])).not.toBeInTheDocument();
	});

	it('should increase the member list counter when a new member is added', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const store = generateStore();
		registerGetDistributionListMembersHandler([
			faker.internet.email(),
			faker.internet.email(),
			faker.internet.email()
		]);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, {
			store
		});
		await screen.findByText(dlEmail);
		await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);

		const newMember = 'newmember@example.com';
		await user.type(screen.getByRole('textbox', { name: /insert an address/i }), newMember);
		await user.click(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
		);
		expect(screen.getByText(/member list 4/i)).toBeVisible();
	});

	test('should decrease the member list counter when a member is removed', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const store = generateStore();
		const members = [faker.internet.email(), faker.internet.email(), faker.internet.email()];
		registerGetDistributionListMembersHandler(members);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, {
			store
		});
		await screen.findByText(dlEmail);
		const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
		const memberToRemoveElement = membersListItems.find(
			(element) => within(element).queryByText(members[1]) !== null
		) as HTMLElement;
		await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
		expect(screen.getByText(/member list 2/i)).toBeVisible();
	});

	describe('Modal footer', () => {
		describe('Cancel action button', () => {
			it('should be enabled', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, { store });
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				expect(screen.getByRole('button', { name: 'cancel' })).toBeEnabled();
			});

			it('should call the onClose callback when clicked', async () => {
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dlEmail = 'dl-mail@domain.net';
				const onClose = jest.fn();
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail, onClose })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				const button = screen.getByRole('button', { name: 'cancel' });
				await user.click(button);
				expect(onClose).toHaveBeenCalled();
			});

			// TODO move in the edit-dl action tests
			// it('should close the modal when clicked', async () => {
			// 	const dlEmail = 'dl-mail@domain.net';
			// 	const store = generateStore();
			// 	registerAPIHandler([faker.internet.email()]);
			// 	const { user } = setupTest(<EditDLControllerComponent email={dlEmail} />, { store });
			// 	const dlEmailLabel = await screen.findByText(dlEmail);
			// 	// await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
			// 	const button = screen.getByRole('button', { name: 'cancel' });
			// 	await user.click(button);
			// 	await waitFor(() => {
			// 		expect(dlEmailLabel).not.toBeInTheDocument();
			// 	});
			// });
		});

		describe('Save action button', () => {
			it('should be visible', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, { store });
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				expect(screen.getByRole('button', { name: 'save' })).toBeVisible();
			});

			it('should be disabled by default', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />, { store });
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
			});

			it('should become enabled when a new member is added', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				const newMember = 'newmember@example.com';
				await user.type(screen.getByRole('textbox', { name: /insert an address/i }), newMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become enabled when a member is removed', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become disabled when there are no differences from the initial state', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const store = generateStore();
				const initialMember = faker.internet.email();
				registerGetDistributionListMembersHandler([faker.internet.email(), initialMember]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				const listItems = await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				const initialMemberItem = listItems.find(
					(item) => within(item).queryByText(initialMember) !== null
				) as HTMLElement;
				await user.click(within(initialMemberItem).getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
				await user.type(screen.getByRole('textbox', { name: /insert an address/i }), initialMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeDisabled());
			});

			it('should call the API when clicked', async () => {
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				registerDistributionListActionHandler();
				const dlEmail = 'dl-mail@domain.net';
				const onSave = jest.fn();
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail, onSave })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
			});
			it.todo('should cause a success snackbar to appear when then API return a success result');

			it('should call the onSave callback when clicked', async () => {
				const store = generateStore();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dlEmail = 'dl-mail@domain.net';
				const onSave = jest.fn();
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail, onSave })} />,
					{ store }
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				expect(onSave).toHaveBeenCalled();
			});

			it.todo('should cause a error snackbar to appear when then API return an error result');
		});
	});
});
