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
import { ContactInputItem, ContactInputOnChange, ContactInputValue, USER_TYPES } from './types';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { UserEvent, screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { FullAutocompleteRequest, FullAutocompleteResponse } from '../types/contact';
import {
	clickExpandDL,
	createDistributionListChip,
	createGetDistributionListInterceptor,
	createSimpleChip,
	SELECT_ALL
} from './test/mocks';
import { registerGetDistributionListMembersHandler } from '../../tests/msw-handlers/get-distribution-list-members';

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

		const autocompleteInterceptor = createSoapAPIInterceptor<
			FullAutocompleteRequest,
			FullAutocompleteResponse
		>('FullAutocomplete', {
			canBeCached: true,
			match: [contact]
		});

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.email);
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		await autocompleteInterceptor;
		expect(await within(dropdown).findByText(contact.first)).toBeVisible();
		expect(await within(dropdown).findByText(contact.email)).toBeVisible();
	});

	it('should render a dropdown with a contact group with an avatar', async () => {
		const contact = {
			display: 'testgroup',
			isGroup: true,
			id: '123'
		};

		const autocompleteInterceptor = createSoapAPIInterceptor<
			FullAutocompleteRequest,
			FullAutocompleteResponse
		>('FullAutocomplete', {
			canBeCached: true,
			match: [contact]
		});

		const { user } = setupTest(<ContactInput defaultValue={[]} orderedAccountIds={[]} />);

		const input = screen.getByRole('textbox');
		await user.type(input, contact.display);
		const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
		await autocompleteInterceptor;
		const avatar = await within(dropdown).findByTestId(TESTID_SELECTORS.avatar);
		expect(await within(dropdown).findByText(contact.display)).toBeVisible();
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
				id: contact.email,
				value: {
					email: contact.email,
					id: contact.email,
					type: USER_TYPES.CONTACT
				},
				label: contact.email,
				error: false
			})
		]);
	});

	it('renders label on ContactInput', async () => {
		const email: ContactInputItem = {
			label: 'alice@domain.loc',
			value: { id: '1', email: 'alice@domain.loc', type: USER_TYPES.CONTACT }
		};

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

	it('should keep the previous chips after expanding a distribution list chip', async () => {
		const onChangeFn = jest.fn();
		const simpleChip = createSimpleChip({ label: 'simple chip', email: 'simple-chip@email.it' });
		const dlChip = createDistributionListChip('distribution-list@email.it');
		registerGetDistributionListMembersHandler(['dlmail1@email.test']);
		const dlInterceptor = createGetDistributionListInterceptor([
			{ id: dlChip.value.id, name: dlChip.label }
		]);

		const { user } = setupTest(
			<ContactInput
				defaultValue={[simpleChip, dlChip]}
				orderedAccountIds={[]}
				onChange={onChangeFn}
			/>
		);
		await dlInterceptor;
		await clickExpandDL(user);
		const selectAllButton = await screen.findByRole('button', { name: SELECT_ALL });
		await user.click(selectAllButton);

		expect(onChangeFn).toHaveBeenCalledWith([
			simpleChip,
			{
				id: 'dlmail1@email.test',
				label: 'dlmail1@email.test',
				value: { email: 'dlmail1@email.test', id: 'dlmail1@email.test', type: 'CONTACT' }
			}
		]);
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
