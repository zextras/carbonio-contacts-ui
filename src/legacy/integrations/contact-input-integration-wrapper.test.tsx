/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { ContactInput } from './contact-input';
import { ContactInputIntegrationWrapper } from './contact-input-integration-wrapper';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import {
	registerFullAutocompleteHandler,
	registerGetDistributionListHandler
} from '../../tests/msw-handlers';
import { generateStore } from '../tests/generators/store';

const contactChipItem = {
	email: faker.internet.email()
};

const distributionListChipItem = {
	email: faker.internet.email(),
	isGroup: true
};

const invalidChipItem = {
	email: 'asd'
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

describe('Contact input integration wrapper', () => {
	describe('actions', () => {
		describe.each([
			['simple contact', contactChipItem],
			['distribution list', distributionListChipItem]
		])('on valid %s', (_, contact) => {
			it('should set edit action on chip to create when chip is created by typing', async () => {
				const store = generateStore();
				const onChange = jest.fn();
				registerFullAutocompleteHandler([]);
				const { user } = setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[]}
						placeholder={''}
						extraAccountsIds={[]}
						onChange={onChange}
					/>,
					{
						store
					}
				);
				await act(async () => {
					await user.type(screen.getByRole('textbox'), `${contact.email},`);
				});
				expect(onChange).toHaveBeenCalledWith([
					expect.objectContaining({ actions: [editValidChipAction] })
				]);
			});

			// FIXME(characterization test): edit action should be available also on chip created with enter
			it('should not set edit action on chip to create when chip is created by pressing enter', async () => {
				const onChange = jest.fn();
				const contact1 = { ...contact, email: 'email-1@domain.com' };
				const contact2 = { email: 'email-2@domain.com' };
				const contact3 = { email: 'email-3@domain.com' };
				registerFullAutocompleteHandler([contact1, contact2, contact3]);
				const { user } = setupTest(
					<ContactInput
						defaultValue={[]}
						placeholder={''}
						extraAccountsIds={[]}
						onChange={onChange}
					/>
				);
				await user.type(screen.getByRole('textbox'), contact1.email[0]);
				act(() => {
					jest.runOnlyPendingTimers();
				});
				await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
				expect(await screen.findByText(contact3.email)).toBeVisible();
				await act(async () => {
					await user.keyboard('{Enter}');
				});
				await waitFor(() => expect(onChange).toHaveBeenCalled());
				expect(onChange).toHaveBeenCalledWith([
					expect.not.objectContaining({ actions: [editValidChipAction] })
				]);
			});

			// FIXME(characterization test): edit action should be available also on chip created from dropdown
			it('should not set edit action on chip to create when valid chip is created by clicking on a dropdown option', async () => {
				const store = generateStore();
				const onChange = jest.fn();
				registerFullAutocompleteHandler([contact]);
				const { user } = setupTest(
					<ContactInput
						defaultValue={[]}
						placeholder={''}
						extraAccountsIds={[]}
						onChange={onChange}
					/>,
					{
						store
					}
				);
				await user.type(screen.getByRole('textbox'), `${contact.email[0]}`);
				act(() => {
					jest.runOnlyPendingTimers();
				});
				const dropdown = await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
				const dropdownItem = await within(dropdown).findByText(contact.email);
				await user.click(dropdownItem);
				expect(onChange).toHaveBeenCalledWith([
					expect.not.objectContaining({ actions: [editValidChipAction] })
				]);
			});
		});

		describe('on simple contact', () => {
			it('should show custom action if value is set from outside and contain the action', async () => {
				const store = generateStore();
				registerGetDistributionListHandler(contactChipItem);
				setupTest(
					<ContactInput
						defaultValue={[{ ...contactChipItem, actions: [customAction] }]}
						placeholder={''}
						extraAccountsIds={[]}
					/>,
					{
						store
					}
				);

				expect(
					screen.getByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
				).toBeVisible();
			});
		});

		describe('on distribution list contact', () => {
			// FIXME(characterization test): on distribution list chip actions set from outside are overwritten
			it('should not show custom action if value is set from outside and contain the action', async () => {
				const store = generateStore();
				const handler = registerGetDistributionListHandler(distributionListChipItem);

				setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[
							{
								...distributionListChipItem,

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								actions: [customAction]
							}
						]}
						placeholder={''}
						extraAccountsIds={[]}
					/>,
					{
						store
					}
				);

				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(
					screen.queryByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
				).not.toBeInTheDocument();
			});

			it('should show action to see the members list', async () => {
				const handler = registerGetDistributionListHandler(distributionListChipItem);
				setupTest(
					<ContactInput
						defaultValue={[
							{
								...distributionListChipItem,

								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								actions: [customAction]
							}
						]}
						placeholder={''}
						extraAccountsIds={[]}
					/>
				);

				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.EXPAND_DL })
				).toBeVisible();
			});

			it('should show action to see edit the distribution list if user is owner', async () => {
				const handler = registerGetDistributionListHandler({
					...distributionListChipItem,
					owners: [mockedAccount]
				});
				setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[distributionListChipItem]}
						placeholder={''}
						extraAccountsIds={[]}
					/>
				);

				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.EDIT_DL })
				).toBeVisible();
			});
		});

		describe('on invalid contact', () => {
			it('should show remove action on value set from outside', () => {
				const store = generateStore();
				setupTest(
					<ContactInput defaultValue={[invalidChipItem]} placeholder={''} extraAccountsIds={[]} />,
					{
						store
					}
				);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.CLOSE })
				).toBeVisible();
			});

			it('should not show edit action if invalid contact is set from outside', () => {
				const store = generateStore();
				setupTest(
					<ContactInput defaultValue={[invalidChipItem]} placeholder={''} extraAccountsIds={[]} />,
					{
						store
					}
				);
				expect(
					screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.EDIT_CHIP })
				).not.toBeInTheDocument();
			});

			it('should set edit action on chip of invalid contact to create when chip is created by typing', async () => {
				const store = generateStore();
				const onChange = jest.fn();
				const { user } = setupTest(
					<ContactInput
						defaultValue={[]}
						placeholder={''}
						extraAccountsIds={[]}
						onChange={onChange}
					/>,
					{
						store
					}
				);
				await act(async () => {
					await user.type(screen.getByRole('textbox'), `${invalidChipItem.email},`);
				});
				expect(onChange).toHaveBeenCalledWith([
					expect.objectContaining({ actions: [editInvalidChipAction] })
				]);
			});

			it('should not set edit action on invalid chip to create when chip is created by clicking on a dropdown option', async () => {
				const store = generateStore();
				const onChange = jest.fn();
				registerFullAutocompleteHandler([{ ...invalidChipItem, first: invalidChipItem.email }]);
				const { user } = setupTest(
					<ContactInput
						defaultValue={[]}
						placeholder={''}
						extraAccountsIds={[]}
						onChange={onChange}
					/>,
					{
						store
					}
				);
				await user.type(screen.getByRole('textbox'), `${invalidChipItem.email[0]}`);
				act(() => {
					jest.runOnlyPendingTimers();
				});
				const dropdown = await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
				const dropdownItem = await within(dropdown).findByText(RegExp(invalidChipItem.email));
				await user.click(dropdownItem);
				expect(onChange).toHaveBeenCalledWith([
					expect.not.objectContaining({ actions: [editInvalidChipAction] })
				]);
			});
		});
	});
});
