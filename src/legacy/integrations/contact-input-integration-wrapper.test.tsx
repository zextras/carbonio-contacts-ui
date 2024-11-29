/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, waitFor } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { ContactInputIntegrationWrapper } from './contact-input-integration-wrapper';
import {
	clickExpandDL,
	createAutocompleteInterceptor,
	createDistributionListChip,
	createGetContactRequestInterceptor,
	createGetDistributionListInterceptor,
	createSimpleChip,
	editInvalidChipAction,
	editValidChipAction,
	generateGroupMemberChip,
	SELECT_ALL,
	typeAndSelectOptionFromDropdown
} from './test/mocks';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { registerGetDistributionListMembersHandler } from '../../tests/msw-handlers/get-distribution-list-members';
import { generateDistributionList } from '../../tests/utils';

const VALID_EMAIL = 'valid@email.it';
const INVALID_EMAIL = 'invalid@email';

const TRIGGER_ADD_CONTACT_CHARACTER = `,`;

const CUSTOM_ACTION: ChipAction = {
	id: 'custom-action',
	type: 'button',
	icon: 'PeopleOutline',
	onClick: () => undefined
};

describe('Contact input integration wrapper', () => {
	it('should set external contact chips as draggable if drag and drop is enabled', async () => {
		setupTest(
			<ContactInputIntegrationWrapper
				defaultValue={[createSimpleChip()]}
				orderedAccountIds={[]}
				dragAndDropEnabled
			/>
		);

		expect(screen.queryByTestId('default-chip')).toHaveProperty('draggable', true);
	});

	it('should NOT set external contact chips as draggable if drag and drop is disabled', async () => {
		setupTest(
			<ContactInputIntegrationWrapper
				defaultValue={[createSimpleChip()]}
				orderedAccountIds={[]}
				dragAndDropEnabled={false}
			/>
		);
		expect(screen.queryByTestId('default-chip')).toHaveProperty('draggable', false);
	});
	it('should display multiple chips', async () => {
		const dl = createDistributionListChip(VALID_EMAIL);
		const dlInterceptor = createGetDistributionListInterceptor([
			{ id: dl.value.id, name: dl.label }
		]);
		setupTest(
			<ContactInputIntegrationWrapper
				defaultValue={[createSimpleChip({ label: 'Test User' }), dl]}
				orderedAccountIds={[]}
			/>
		);
		await dlInterceptor;

		expect(await screen.findByText('Test User')).toBeVisible();
		expect(await screen.findByText(dl.value.email)).toBeVisible();
	});

	it('should create chip with edit action when chip is created by by pressing enter', async () => {
		const onChange = jest.fn();
		registerFullAutocompleteHandler([]);
		const { user } = setupTest(
			<ContactInputIntegrationWrapper
				defaultValue={[]}
				orderedAccountIds={[]}
				onChange={onChange}
			/>
		);
		await user.type(screen.getByRole('textbox'), VALID_EMAIL);
		await user.keyboard('{Enter}');
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({ actions: [editValidChipAction] })
		]);
	});

	describe('on simple contact', () => {
		it('renders the chip with the provided label', () => {
			const simpleContact = createSimpleChip({ label: 'AAA' });

			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[simpleContact]} orderedAccountIds={[]} />
			);

			expect(screen.getByText('AAA')).toBeVisible();
		});

		it('calls onChange with label equal to firstName if present in autocomplete', async () => {
			const first = 'My name is';
			const interceptor = createAutocompleteInterceptor([{ email: VALID_EMAIL, first }]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					onChange={onChange}
					defaultValue={[]}
					orderedAccountIds={[]}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, first);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: first })]);
		});
		it('calls onChange with label equal to email if no other field in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([{ email: VALID_EMAIL }]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					onChange={onChange}
					defaultValue={[]}
					orderedAccountIds={[]}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: VALID_EMAIL })]);
		});
		it('calls onChange with label equal to fullname if present and no first, last or middle in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, full: 'My fullname' }
			]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					onChange={onChange}
					defaultValue={[]}
					orderedAccountIds={[]}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ label: 'My fullname' })]);
		});
		it('calls onChange with label equal to first + middle + last even if fullname present in autocomplete', async () => {
			const interceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, full: 'My fullname', first: 'first', middle: 'middle', last: 'last' }
			]);
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					onChange={onChange}
					defaultValue={[]}
					orderedAccountIds={[]}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await interceptor;

			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ label: 'first middle last' })
			]);
		});
		it('calls onChange with a chip with edit action after selecting a simple contact on the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, isGroup: false }
			]);

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editValidChipAction] })
			]);
		});
		it('should show display custom action if provided', async () => {
			const contactChipItem = createSimpleChip();
			registerGetDistributionListHandler(generateDistributionList(contactChipItem));
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[
						{
							...contactChipItem,
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);

			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${CUSTOM_ACTION.icon}` })
			).toBeVisible();
		});
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[createSimpleChip()]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});
	});

	describe('on distribution list contact', () => {
		it('calls onChange with a chip with edit action after selecting a distribution list on the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ email: VALID_EMAIL, isGroup: true }
			]);

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, VALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editValidChipAction] })
			]);
		});
		it('should show custom action if provided', async () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[
						{
							...createDistributionListChip(VALID_EMAIL),
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${CUSTOM_ACTION.icon}` })
			).toBeVisible();
		});
		it('should show action to see the members list', async () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[
						{
							...createDistributionListChip(VALID_EMAIL),
							actions: [CUSTOM_ACTION]
						}
					]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
			).toBeVisible();
		});
		it('should not show the edit DL action if not provided in defaultValue', async () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
				/>
			);

			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
			).not.toBeInTheDocument();
		});
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});

		it('calls onChange with all member in distribution list', async () => {
			const onChange = jest.fn();

			const getMemberHandler = registerGetDistributionListMembersHandler([
				'dlmember1@test.it',
				'dlmember2@test.it'
			]);
			const getDLInterceptor = createSoapAPIInterceptor<
				GetDistributionListRequest,
				GetDistributionListResponse
			>('GetDistributionList', {
				_jsns: 'urn:zimbraAccount',
				dl: [{ id: '123', name: 'dl@dl.test' }],
				requestId: ''
			});

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[createDistributionListChip(VALID_EMAIL)]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await getDLInterceptor;
			await act(() => clickExpandDL(user));
			await getMemberHandler;

			await user.click(screen.getByRole('button', { name: SELECT_ALL }));

			expect(onChange).toHaveBeenCalledWith([
				{
					id: 'dlmember1@test.it',
					label: 'dlmember1@test.it',
					value: {
						email: 'dlmember1@test.it',
						id: 'dlmember1@test.it',
						type: 'CONTACT'
					}
				},
				{
					id: 'dlmember2@test.it',
					label: 'dlmember2@test.it',
					value: {
						email: 'dlmember2@test.it',
						id: 'dlmember2@test.it',
						type: 'CONTACT'
					}
				}
			]);
		});
	});

	describe('on invalid contact', () => {
		const INVALID_CHIP = createSimpleChip({ email: INVALID_EMAIL });
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[INVALID_CHIP]} orderedAccountIds={[]} />
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});
		it('should not show edit action if invalid contact is set from outside and actions not provided', () => {
			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[INVALID_CHIP]} orderedAccountIds={[]} />
			);
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editChip })
			).not.toBeInTheDocument();
		});
		it('should call onChange with a chip with edit action if an invalid contact is added by typing', async () => {
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await act(async () => {
				await user.type(screen.getByRole('textbox'), INVALID_EMAIL);
			});
			await act(async () => {
				await user.type(screen.getByRole('textbox'), TRIGGER_ADD_CONTACT_CHARACTER);
			});
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
		it('should create an invalid chip with edit action after selecting a contact with invalid email from the dropdown', async () => {
			const onChange = jest.fn();
			const autocompleteInterceptor = createAutocompleteInterceptor([{ email: INVALID_EMAIL }]);

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await typeAndSelectOptionFromDropdown(user, INVALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
	});

	describe('on group selection', () => {
		it('should call onChange passing the members of the selected group', async () => {
			const onChange = jest.fn();
			const GROUP_NAME = 'GROUP_MAME';
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ display: GROUP_NAME, isGroup: true, id: 'id-1' }
			]);

			const groupMember1 = 'test1@test.com';
			const groupMember2 = 'test2@test.com';
			const groupMember3 = 'test3@test.com';
			const createGetContactInterceptor = createGetContactRequestInterceptor([
				{
					id: '5539',
					l: '7',
					d: 1732210444000,
					rev: 23712,
					fileAsStr: 'Test',
					_attrs: {
						nickname: 'Test Group',
						fullName: 'Test Group',
						type: 'group'
					},
					m: [
						{
							type: 'I',
							value: groupMember1
						},
						{
							type: 'I',
							value: groupMember2
						},
						{
							type: 'I',
							value: groupMember3
						}
					]
				}
			]);

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);

			await typeAndSelectOptionFromDropdown(user, GROUP_NAME);
			await autocompleteInterceptor;
			await createGetContactInterceptor;
			await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect(onChange).toHaveBeenCalledWith([
					generateGroupMemberChip(groupMember1),
					generateGroupMemberChip(groupMember2),
					generateGroupMemberChip(groupMember3)
				])
			);
		});

		it('should not remove existing users/dl after adding a group', async () => {
			const onChange = jest.fn();
			const GROUP_NAME = 'GROUP_MAME';
			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ display: GROUP_NAME, isGroup: true, id: 'id-1' }
			]);

			const groupMember1 = 'test1@test.com';
			const groupMember2 = 'test2@test.com';
			const groupMember3 = 'test3@test.com';
			const createGetContactInterceptor = createGetContactRequestInterceptor([
				{
					id: '5539',
					l: '7',
					d: 1732210444000,
					rev: 23712,
					fileAsStr: 'Test',
					_attrs: {
						nickname: 'Test Group',
						fullName: 'Test Group',
						type: 'group'
					},
					m: [
						{
							type: 'I',
							value: groupMember1
						},
						{
							type: 'I',
							value: groupMember2
						},
						{
							type: 'I',
							value: groupMember3
						}
					]
				}
			]);

			const simpleChip = createSimpleChip();
			const distributionListChip = createDistributionListChip(VALID_EMAIL);
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[simpleChip, distributionListChip]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);

			await typeAndSelectOptionFromDropdown(user, GROUP_NAME);
			await autocompleteInterceptor;
			await createGetContactInterceptor;
			await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
			await waitFor(() =>
				expect(onChange).toHaveBeenCalledWith([
					expect.objectContaining(simpleChip),
					expect.objectContaining(distributionListChip),
					expect.objectContaining(generateGroupMemberChip(groupMember1)),
					expect.objectContaining(generateGroupMemberChip(groupMember2)),
					expect.objectContaining(generateGroupMemberChip(groupMember3))
				])
			);
		});
	});
});
