/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, within } from '@testing-library/react';

import { ContactInput } from './contact-input';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { Match } from '../types/contact';

describe.skip('Contact input', () => {
	it('should render a textbox', async () => {
		const placeholder = faker.string.alpha();
		setupTest(<ContactInput defaultValue={[]} placeholder={placeholder} extraAccountsIds={[]} />);
		expect(screen.getByRole('textbox', { name: placeholder })).toBeVisible();
	});

	it('should render a dropdown with a contact', async () => {
		const contact = {
			email: faker.internet.email(),
			first: faker.person.firstName(),
			isGroup: false
		} satisfies Match;
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} extraAccountsIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.email);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		expect(within(dropdown).getByText(contact.email)).toBeVisible();
		expect(within(dropdown).getByText(contact.first)).toBeVisible();
	});

	it('should render a dropdown with a contact group', async () => {
		const contact = {
			first: faker.person.firstName(),
			isGroup: true
		} satisfies Match;
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} extraAccountsIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.first);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		expect(within(dropdown).getByText(contact.first)).toBeVisible();
	});

	it('should render a dropdown with a contact group with an avatar', async () => {
		const contact = {
			first: faker.person.firstName(),
			isGroup: true
		} satisfies Match;
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} extraAccountsIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.first);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		const avatar = within(dropdown).getByTestId(TESTID_SELECTORS.avatar);
		expect(within(dropdown).getByText(contact.first)).toBeVisible();
		expect(within(avatar).queryByText('?')).not.toBeInTheDocument();
	});

	it('should call onChange with the new chip to create', async () => {
		const contact = {
			email: faker.internet.email()
		};
		const onChange = jest.fn();
		const { user } = setupTest(
			<ContactInput defaultValue={[]} placeholder={''} extraAccountsIds={[]} onChange={onChange} />
		);

		await user.type(screen.getByRole('textbox'), contact.email);
		await act(async () => {
			await user.type(screen.getByRole('textbox'), ',');
		});
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({
				email: contact.email,
				id: expect.anything(),
				label: contact.email,
				error: false
			})
		]);
	});
});
