/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, within } from '@testing-library/react';

import { ContactInput } from './contact-input';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { ContactInputItem, ContactInputOnChange, ContactInputValue } from '../types/integrations';
import { isArray } from 'lodash';

describe('Contact input', () => {
	it('should render a textbox', async () => {
		const placeholder = faker.string.alpha();
		setupTest(<ContactInput defaultValue={[]} placeholder={placeholder} orderedAccountIds={[]} />);
		expect(screen.getByRole('textbox', { name: placeholder })).toBeVisible();
	});

	it('should render a dropdown with a contact', async () => {
		const contact = {
			email: faker.internet.email(),
			first: faker.person.firstName(),
			isGroup: false
		};
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.email);
		act(() => {
			// run timers of dropdown
			jest.runOnlyPendingTimers();
		});
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		expect(within(dropdown).getByText(contact.email, { exact: false })).toBeVisible();
		expect(within(dropdown).getByText(contact.first, { exact: false })).toBeVisible();
	});

	it('should render a dropdown with a contact group', async () => {
		const contact = {
			first: faker.person.firstName(),
			isGroup: true
		};
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

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
		};
		registerFullAutocompleteHandler([contact]);

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

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
			<ContactInput defaultValue={[]} placeholder={''} orderedAccountIds={[]} onChange={onChange} />
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

	it('should render chips correctly if user paste a string', async () => {
		let defaultValue: ContactInputItem[] = [];
		const onChange: ContactInputOnChange = (value) => {
			const values = Array.isArray(value) ? value : [value];
			defaultValue = [...defaultValue, ...values];
		};

		const exampleString =
			'”luca” <luca@comain.loc>, “another luca” <another@domain.loc> daniele@email.it "Valid" <a@valid.email>; "Another" <another@valid.it>; "Alessio" <alessio@email.it>; "INVALID" <invalid>';

		const { user } = setupTest(
			<ContactInput
				defaultValue={defaultValue}
				placeholder={''}
				orderedAccountIds={[]}
				onChange={onChange}
			/>
		);

		await user.click(screen.getByRole('textbox'));
		await user.paste(exampleString);

		screen.logTestingPlaygroundURL();

		await waitFor(() => {
			expect(screen.getByText('another@domain.loc')).toBeInTheDocument();
		});

		expect(test).toBeInTheDocument();
	});
});
