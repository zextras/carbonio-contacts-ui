/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, within } from '@testing-library/react';

import { ContactInput } from './contact-input';
import { UserEvent, screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';
import { ContactInputItem, ContactInputOnChange, ContactInputValue } from '../types/integrations';

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

	it('render single email on ContactInput', async () => {
		const email: ContactInputItem = { email: 'alice@domain.loc' };

		setupTest(<ContactInput defaultValue={[email]} />);

		await waitFor(() => {
			expect(screen.getByText('alice@domain.loc')).toBeInTheDocument();
		});
	});

	it('paste a simple email', async () => {
		const { user } = setupTest(<TestableContactInput />);

		paste(user, screen.getByRole('textbox'), 'bruno@domain.loc');

		expect(await screen.findByText('bruno@domain.loc')).toBeInTheDocument();
	});

	it('paste a complex string with multiple emails', async () => {
		const complexText =
			'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>;\n"not valid" <not@valid>';
		const { user } = setupTest(<TestableContactInput />);

		paste(user, screen.getByRole('textbox'), complexText);

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
		expect(screen.queryByText('not@valid')).not.toBeInTheDocument();
	});
});

function TestableContactInput(): ReactElement {
	const [defaultValue, setDefaultValue] = useState<ContactInputValue>([]);

	const onChange: ContactInputOnChange = (value) => {
		setDefaultValue([...defaultValue, ...value]);
	};

	return <ContactInput defaultValue={defaultValue} onChange={onChange} />;
}

async function paste(user: UserEvent, element: HTMLElement, text: string): Promise<void> {
	await user.click(element);
	await user.paste({
		getData: () => text
	} as unknown as DataTransfer);
}
