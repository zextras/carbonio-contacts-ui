/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { ContactInputIntegrationWrapper } from './contact-input-integration-wrapper';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { JEST_MOCKED_ERROR, TESTID_SELECTORS, TIMERS } from '../../constants/tests';
import { DistributionList } from '../../model/distribution-list';
import {
	registerFullAutocompleteHandler,
	registerGetDistributionListHandler
} from '../../tests/msw-handlers';

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

const distributionList = {
	email: distributionListChipItem.email,
	displayName: 'dl 1',
	owners: [{ id: mockedAccount.id, name: mockedAccount.name }]
} satisfies Partial<DistributionList>;

const user1 = {
	id: 'user1ID',
	email: 'user1@mail.com',
	label: 'user1'
};

describe('Contact input integration wrapper', () => {
	describe('actions', () => {
		describe.each([
			['simple contact', contactChipItem],
			['distribution list', distributionListChipItem]
		])('on valid %s', (_, contact) => {
			it('should set edit action on chip to create when chip is created by typing', async () => {
				const onChange = jest.fn();
				registerFullAutocompleteHandler([]);
				const { user } = setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[]}
						extraAccountsIds={[]}
						onChange={onChange}
					/>
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
					<ContactInputIntegrationWrapper
						defaultValue={[]}
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
				const onChange = jest.fn();
				registerFullAutocompleteHandler([contact]);
				const { user } = setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[]}
						extraAccountsIds={[]}
						onChange={onChange}
					/>
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
				registerGetDistributionListHandler(contactChipItem);
				setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[
							{
								...contactChipItem,
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								actions: [customAction]
							}
						]}
						extraAccountsIds={[]}
					/>
				);

				expect(
					screen.getByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
				).toBeVisible();
			});
		});

		describe('on distribution list contact', () => {
			it('should show custom action if value is set from outside and contain the action', async () => {
				const handler = registerGetDistributionListHandler(distributionList);

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
						extraAccountsIds={[]}
					/>
				);

				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(
					screen.getByRoleWithIcon('button', { icon: `icon: ${customAction.icon}` })
				).toBeVisible();
			});

			it('should show action to see the members list', async () => {
				const handler = registerGetDistributionListHandler(distributionList);
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
						extraAccountsIds={[]}
					/>
				);

				await waitFor(() => expect(handler).toHaveBeenCalled());
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.EXPAND_DL })
				).toBeVisible();
			});

			describe('Editing DL', () => {
				it("doesn't show the edit icon if the contact isn't a DL", () => {
					const handler = registerGetDistributionListHandler(distributionList);

					setupTest(
						<ContactInputIntegrationWrapper
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							defaultValue={[contactChipItem]}
							extraAccountsIds={[]}
						/>
					);

					const editButton = screen.queryByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.EDIT_DL
					});
					expect(editButton).not.toBeInTheDocument();
					expect(handler).not.toHaveBeenCalled();
				});

				it('should not show the edit icon if the contact is a DL but the current user is not the DL owner', async () => {
					const handler = registerGetDistributionListHandler({
						...distributionList,
						owners: [{ id: faker.string.uuid(), name: faker.person.fullName() }]
					});

					setupTest(
						<ContactInputIntegrationWrapper
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							defaultValue={[distributionListChipItem]}
							extraAccountsIds={[]}
						/>
					);

					await waitFor(() => expect(handler).toHaveBeenCalled());
					expect(
						screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.EDIT_DL })
					).not.toBeInTheDocument();
				});

				it('should show the edit icon if the contact is a DL and the current user is the DL owner', async () => {
					const handler = registerGetDistributionListHandler(distributionList);

					setupTest(
						<ContactInputIntegrationWrapper
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							defaultValue={[distributionListChipItem]}
							extraAccountsIds={[]}
						/>
					);

					await waitFor(() => expect(handler).toHaveBeenCalled());
					expect(
						await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.EDIT_DL })
					).toBeVisible();
				});

				it('if the user clicks on the edit icon the DL title is displayed inside a modal', async () => {
					const handler = registerGetDistributionListHandler(distributionList);

					const { user } = setupTest(
						<ContactInputIntegrationWrapper
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							defaultValue={[distributionListChipItem]}
							extraAccountsIds={[]}
						/>
					);

					await waitFor(() => expect(handler).toHaveBeenCalled());
					const editButton = await screen.findByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.EDIT_DL
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

				it('should not show the edit action if the distribution list cannot be retrieved', async () => {
					const handler = registerGetDistributionListHandler(distributionList, JEST_MOCKED_ERROR);

					setupTest(
						<ContactInputIntegrationWrapper
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							defaultValue={[distributionListChipItem]}
							extraAccountsIds={[]}
						/>
					);

					await waitFor(() => expect(handler).toHaveBeenCalled());
					expect(
						screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.EDIT_DL })
					).not.toBeInTheDocument();
				});
			});
		});

		describe('on invalid contact', () => {
			it('should show remove action on value set from outside', () => {
				setupTest(
					<ContactInputIntegrationWrapper
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						defaultValue={[invalidChipItem]}
						extraAccountsIds={[]}
					/>
				);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.CLOSE })
				).toBeVisible();
			});

			it('should not show edit action if invalid contact is set from outside', () => {
				setupTest(
					<ContactInputIntegrationWrapper
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						defaultValue={[invalidChipItem]}
						extraAccountsIds={[]}
					/>
				);
				expect(
					screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.EDIT_CHIP })
				).not.toBeInTheDocument();
			});

			it('should set edit action on chip of invalid contact to create when chip is created by typing', async () => {
				const onChange = jest.fn();
				const { user } = setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[]}
						extraAccountsIds={[]}
						onChange={onChange}
					/>
				);
				await act(async () => {
					await user.type(screen.getByRole('textbox'), `${invalidChipItem.email},`);
				});
				expect(onChange).toHaveBeenCalledWith([
					expect.objectContaining({ actions: [editInvalidChipAction] })
				]);
			});

			it('should not set edit action on invalid chip to create when chip is created by clicking on a dropdown option', async () => {
				const onChange = jest.fn();
				registerFullAutocompleteHandler([{ ...invalidChipItem, first: invalidChipItem.email }]);
				const { user } = setupTest(
					<ContactInputIntegrationWrapper
						defaultValue={[]}
						extraAccountsIds={[]}
						onChange={onChange}
					/>
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
