/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { ContactInputIntegrationWrapper } from './contact-input-integration-wrapper';
import {
	createAutocompleteInterceptor,
	createGetContactRequestInterceptor,
	createGetDistributionListInterceptor,
	createSimpleChipItem,
	editInvalidChipAction,
	editValidChipAction,
	typeAndSelectOption
} from './test/mocks';
import { USER_TYPES } from './types';
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

const distributionListChipItem = {
	id: VALID_EMAIL,
	label: VALID_EMAIL,
	value: {
		id: VALID_EMAIL,
		email: VALID_EMAIL,
		type: USER_TYPES.DISTRIBUTION_LIST
	}
};

const invalidChipItem = {
	id: INVALID_EMAIL,
	label: INVALID_EMAIL,
	value: {
		id: INVALID_EMAIL,
		email: INVALID_EMAIL,
		type: USER_TYPES.CONTACT
	}
};

const customAction: ChipAction = {
	id: 'custom-action',
	type: 'button',
	icon: 'PeopleOutline',
	onClick: () => undefined
};

const TRIGGER_ADD_CONTACT_CHARACTER = `,`;

describe('Contact input integration wrapper', () => {
	it('should display multiple chips', async () => {
		const dlInterceptor = createGetDistributionListInterceptor([
			{
				id: distributionListChipItem.id,
				name: distributionListChipItem.label
			}
		]);
		setupTest(
			<ContactInputIntegrationWrapper
				defaultValue={[
					createSimpleChipItem('1', 'Test User', 'testuser@test.com'),
					distributionListChipItem
				]}
				orderedAccountIds={[]}
			/>
		);
		await dlInterceptor;

		expect(await screen.findByText('Test User')).toBeVisible();
		expect(await screen.findByText(distributionListChipItem.value.email)).toBeVisible();
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
			const simpleContact = createSimpleChipItem('1', 'AAA', 'test@test.com');

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
			await typeAndSelectOption(user, first);
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
			await typeAndSelectOption(user, VALID_EMAIL);
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
			await typeAndSelectOption(user, VALID_EMAIL);
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
			await typeAndSelectOption(user, VALID_EMAIL);
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
			await typeAndSelectOption(user, VALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editValidChipAction] })
			]);
		});
		it('should show display custom action if provided', async () => {
			const contactChipItem = createSimpleChipItem();
			registerGetDistributionListHandler(generateDistributionList(contactChipItem));
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[
						{
							...contactChipItem,
							actions: [customAction]
						}
					]}
					orderedAccountIds={[]}
				/>
			);

			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
			).toBeVisible();
		});
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[createSimpleChipItem()]}
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
			await typeAndSelectOption(user, VALID_EMAIL);
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
							...distributionListChipItem,
							actions: [customAction]
						}
					]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
			).toBeVisible();
		});
		it('should show action to see the members list', async () => {
			setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[
						{
							...distributionListChipItem,
							actions: [customAction]
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
					defaultValue={[distributionListChipItem]}
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
					defaultValue={[distributionListChipItem]}
					orderedAccountIds={[]}
				/>
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});

		it('calls onChange with all member in distribution list', async () => {
			const onChange = jest.fn();

			const clickExpandDL = async (user: any): Promise<void> => {
				await user.click(
					await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.expandDL })
				);
			};

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
					defaultValue={[distributionListChipItem]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await getDLInterceptor;
			await act(() => clickExpandDL(user));
			await getMemberHandler;

			const SELECT_ALL = /Select address|Select all \d+ addresses/;
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
		it('should show remove action on value set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[invalidChipItem]} orderedAccountIds={[]} />
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});
		it('should not show edit action if invalid contact is set from outside and actions not provided', () => {
			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[invalidChipItem]} orderedAccountIds={[]} />
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
				await user.type(screen.getByRole('textbox'), `${INVALID_EMAIL}`);
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
			await typeAndSelectOption(user, INVALID_EMAIL);
			await autocompleteInterceptor;
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
	});

	describe('on group selection', () => {
		it.skip('should call onChange passing the members of the selected group', async () => {
			const onChange = jest.fn();
			const GROUP_NAME = 'group123';

			const autocompleteInterceptor = createAutocompleteInterceptor([
				{ display: GROUP_NAME, isGroup: true }
			]);

			const createGetContactInterceptor = createGetContactRequestInterceptor([
				{
					id: '5539',
					l: '7',
					d: 1732210444000,
					rev: 23712,
					fileAsStr: 'Davide',
					_attrs: {
						nickname: 'Davide',
						fullName: 'Davide',
						type: 'group'
					},
					m: [
						{
							type: 'I',
							value: 'davide.frison@demo.zextras.io'
						},
						{
							type: 'I',
							value: 'giuliano.caregnato@demo.zextras.io'
						},
						{
							type: 'I',
							value: 'matteo.perdon@demo.zextras.io'
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

			await typeAndSelectOption(user, GROUP_NAME);
			await autocompleteInterceptor;
			await createGetContactInterceptor;
			expect(onChange).toHaveBeenCalledWith([]);
		});
	});
});
