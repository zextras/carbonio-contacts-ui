/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { faker } from '@faker-js/faker';
import { act, fireEvent, waitFor, within } from '@testing-library/react';

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

		expect(within(dropdown).getByText(contact.first)).toBeVisible();
		expect(within(dropdown).getByText(contact.email)).toBeVisible();
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

		await paste(user, screen.getByRole('textbox'), 'bruno@domain.loc');

		expect(await screen.findByText('bruno@domain.loc')).toBeInTheDocument();
	});

	it('paste a complex string with multiple emails', async () => {
		const complexText =
			'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>;\n"not valid" <not@valid>';
		const { user } = setupTest(<TestableContactInput />);

		await paste(user, screen.getByRole('textbox'), complexText);

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(await screen.findByText('"Invalid"')).toBeInTheDocument();
		expect(await screen.findByText('"not valid" <not@valid>')).toBeInTheDocument();
		expect(await screen.findAllByTestId('icon: AlertCircleOutline')).toHaveLength(2);
	});

	it('edit a mail from a pasted list of emails should edit only the selected one and keep the others', async () => {
		const complexText = 'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>';
		const { user } = setupTest(<TestableContactInput />);

		await paste(user, screen.getByRole('textbox'), complexText);

		const invalidChip = getChipWithText('"Invalid"');
		const invalidChipEditButton = within(invalidChip).getAllByRole('button')[0];

		await act(async () => {
			await user.click(invalidChipEditButton);
		});

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(screen.queryByText('"Invalid"')).not.toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveValue('"Invalid"');
	});

	it('edit a mail from a pasted list of emails and focus out should keep the edited chip', async () => {
		const complexText = 'dan@email.it\n"Invalid"\n<a@valid.email>;\n"Another" <another@valid.it>';
		const { user } = setupTest(<TestableContactInput />);

		await paste(user, screen.getByRole('textbox'), complexText);

		const invalidChip = getChipWithText('"Invalid"');
		const invalidChipEditButton = within(invalidChip).getAllByRole('button')[0];

		await act(async () => {
			await user.click(invalidChipEditButton);
		});

		fireEvent.focusOut(screen.getByRole('textbox'));

		expect(await screen.findByText('dan@email.it')).toBeInTheDocument();
		expect(await screen.findByText('a@valid.email')).toBeInTheDocument();
		expect(await screen.findByText('another@valid.it')).toBeInTheDocument();
		expect(await screen.findByText('"Invalid"')).toBeInTheDocument();
	});

	it('open custom contextmenu with a right click', async () => {
		const { user } = setupTest(<TestableContactInput />);

		await user.rightClick(screen.getByTestId('contact-input'));

		expect(await screen.findByText('Paste')).toBeInTheDocument();
		// we can't test the clipboard paste through context menu because it's not supported by jsdom
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
	await act(async () => {
		await user.paste({
			getData: () => text
		} as unknown as DataTransfer);
	});
}

function getChipWithText(text: string): HTMLElement {
	const chips = screen.queryAllByTestId('default-chip');
	const invalidChip = chips.find((chip) => within(chip).queryByText(text, { exact: false }));
	if (!invalidChip) throw new Error(`Chip not found with text: ${text}`);
	return invalidChip;
}
