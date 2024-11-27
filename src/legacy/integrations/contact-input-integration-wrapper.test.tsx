/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, within } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { ContactInputIntegrationWrapper } from './contact-input-integration-wrapper';
import { ContactInputItem, USER_TYPES } from './types';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { generateDistributionList } from '../../tests/utils';
import { FullAutocompleteRequest, FullAutocompleteResponse } from '../types/contact';

const VALID_EMAIL = 'valid@email.it';
const INVALID_EMAIL = 'invalid@email';

const createSimpleChipItem = (
	id = '1',
	label = 'test',
	email = 'test@test.com'
): ContactInputItem => ({
	id,
	label,
	value: {
		id,
		email,
		type: USER_TYPES.CONTACT
	}
});

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

const editValidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: 'action1',
	label: 'Edit E-mail',
	icon: 'EditOutline',
	type: 'button'
});

const editInvalidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: 'action1',
	label: 'E-mail is invalid, click to edit it',
	icon: 'EditOutline',
	type: 'button'
});

const createAutocompleteInterceptor = (
	contacts: FullAutocompleteResponse['match']
): Promise<FullAutocompleteRequest> =>
	createSoapAPIInterceptor<FullAutocompleteRequest, FullAutocompleteResponse>('FullAutocomplete', {
		canBeCached: true,
		match: contacts
	});

describe('Contact input integration wrapper', () => {
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
		it('should create a chip with edit action after selecting a simple contact on the dropdown', async () => {
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
			await user.type(screen.getByRole('textbox'), 'a');

			const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
			await autocompleteInterceptor;
			const dropdownItem = await within(dropdown).findAllByText(VALID_EMAIL);
			await user.click(dropdownItem[0]);
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
	});

	describe('on distribution list contact', () => {
		it('should create a chip with edit action after selecting a distribution list on the dropdown', async () => {
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
			await user.type(screen.getByRole('textbox'), 'a');

			const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
			await autocompleteInterceptor;
			const dropdownItem = await within(dropdown).findAllByText(VALID_EMAIL);
			await user.click(dropdownItem[0]);
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
		it('should not show the edit DL action', async () => {
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
		it('should not show edit action if invalid contact is set from outside', () => {
			setupTest(
				<ContactInputIntegrationWrapper defaultValue={[invalidChipItem]} orderedAccountIds={[]} />
			);
			expect(
				screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editChip })
			).not.toBeInTheDocument();
		});
		it('should set edit action on chip of invalid contact to create when chip is created by typing', async () => {
			const onChange = jest.fn();
			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await act(async () => {
				await user.type(screen.getByRole('textbox'), `${invalidChipItem.value.email},`);
			});
			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
		it('should create an invalid chip with edit action', async () => {
			const onChange = jest.fn();

			const autocompleteInterceptor = createAutocompleteInterceptor([{ email: INVALID_EMAIL }]);

			const { user } = setupTest(
				<ContactInputIntegrationWrapper
					defaultValue={[]}
					orderedAccountIds={[]}
					onChange={onChange}
				/>
			);
			await user.type(screen.getByRole('textbox'), 'email-not-valid');

			const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
			await autocompleteInterceptor;
			const dropdownItem = await within(dropdown).findAllByText(INVALID_EMAIL);
			await user.click(dropdownItem[0]);

			expect(onChange).toHaveBeenCalledWith([
				expect.objectContaining({ actions: [editInvalidChipAction] })
			]);
		});
	});
});
