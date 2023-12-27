/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, screen, within } from '@testing-library/react';
import { rest } from 'msw';

import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { generateStore } from '../../tests/generators/store';
import { ContactInput } from '../contact-input';

describe('Contact input', () => {
	it('should render a component', async () => {
		const store = generateStore();

		setupTest(<ContactInput defaultValue={[]} placeholder="" extraAccountsIds={[]} />, { store });
		expect(screen.getByRole('textbox')).toBeVisible();
	});
	it('should render a dropdown with a contact', async () => {
		const contact = {
			id: faker.string.uuid(),
			email: faker.internet.email(),
			firstName: faker.person.firstName()
		};
		getSetupServer().use(
			rest.post('/service/soap/FullAutocompleteRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Body: {
							FullAutocompleteResponse: `<FullAutocompleteResponse xmlns="urn:zimbraMail"><match email="&lt;${contact.email}>" first="${contact.firstName}" /></FullAutocompleteResponse>`
						}
					})
				)
			)
		);
		const store = generateStore();
		const { user } = setupTest(
			<ContactInput defaultValue={[]} placeholder="" extraAccountsIds={[]} />,
			{ store }
		);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.email);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
		expect(within(dropdown).getByText(contact.email)).toBeVisible();
		expect(within(dropdown).getByText(contact.firstName)).toBeVisible();
	});
	it('should render a dropdown with a contact group', async () => {
		const contact = {
			display: faker.person.firstName()
		};
		getSetupServer().use(
			rest.post('/service/soap/FullAutocompleteRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Body: {
							FullAutocompleteResponse: `<FullAutocompleteResponse xmlns="urn:zimbraMail"><match isGroup="1" display="${contact.display}" /></FullAutocompleteResponse>`
						}
					})
				)
			)
		);
		const store = generateStore();
		const { user } = setupTest(
			<ContactInput defaultValue={[]} placeholder="" extraAccountsIds={[]} />,
			{ store }
		);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.display);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
		expect(within(dropdown).getByText(contact.display)).toBeVisible();
	});
	it('should render a dropdown with a contact group with an avatar', async () => {
		const contact = {
			display: faker.person.firstName()
		};
		getSetupServer().use(
			rest.post('/service/soap/FullAutocompleteRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Body: {
							FullAutocompleteResponse: `<FullAutocompleteResponse xmlns="urn:zimbraMail"><match isGroup="1" display="${contact.display}" /></FullAutocompleteResponse>`
						}
					})
				)
			)
		);
		const store = generateStore();
		const { user } = setupTest(
			<ContactInput defaultValue={[]} placeholder="" extraAccountsIds={[]} />,
			{ store }
		);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.display);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.DROPDOWN_LIST);
		const avatar = within(dropdown).getByTestId(TESTID_SELECTORS.AVATAR);
		expect(within(dropdown).getByText(contact.display)).toBeVisible();
		expect(within(avatar).queryByText('?')).not.toBeInTheDocument();
	});
});
