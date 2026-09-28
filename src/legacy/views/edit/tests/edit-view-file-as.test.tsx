/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { registerCreateContactHandler } from 'legacy/tests/msw/create-contact';
import EditView from 'legacy/views/edit/edit-view';

describe('Edit view - File as', () => {
	it('should default to "Last, First" and update the description in real time', async () => {
		populateFoldersStore();
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		const { user } = setupTest(<EditView />);
		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		const lastNameInput = screen.getByRole('textbox', { name: /last name/i });

		await user.type(firstNameInput, firstName);
		await user.type(lastNameInput, lastName);

		expect(screen.getByText(`${lastName}, ${firstName}`)).toBeVisible();
	});

	it('should recompose the description when a different file as option is selected', async () => {
		populateFoldersStore();
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		const { user } = setupTest(<EditView />);
		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
		await user.type(firstNameInput, firstName);
		await user.type(lastNameInput, lastName);

		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('First Last'));

		expect(screen.getByText(`${firstName} ${lastName}`)).toBeVisible();
	});

	it('should hide the custom text input unless the custom option is selected', async () => {
		populateFoldersStore();

		const { user } = setupTest(<EditView />);
		const customTextInput = screen.getByPlaceholderText(/custom/i);
		expect(customTextInput).not.toBeVisible();
		expect(customTextInput).toBeDisabled();

		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('Custom'));

		expect(customTextInput).toBeVisible();
		expect(customTextInput).toBeEnabled();
	});

	it('should show the custom value as description once typed', async () => {
		populateFoldersStore();
		const customText = faker.lorem.words(3);

		const { user } = setupTest(<EditView />);
		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('Custom'));

		const customTextInput = screen.getByRole('textbox', { name: /custom/i });
		await user.type(customTextInput, customText);

		expect(screen.getByText(customText)).toBeVisible();
	});

	it('should show an error under the custom field once it is left empty on blur', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('Custom'));

		const customTextInput = screen.getByRole('textbox', { name: /custom/i });
		await user.click(customTextInput);
		await user.tab();

		expect(await screen.findByText(/enter a value or select a different option/i)).toBeVisible();
	});

	it('should disable the save button when the custom option is selected and the custom field is empty', async () => {
		populateFoldersStore();
		const newName = faker.person.firstName();

		const { user } = setupTest(<EditView />);
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		await user.type(inputName, newName);

		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('Custom'));

		expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();

		const customTextInput = screen.getByRole('textbox', { name: /custom/i });
		await user.type(customTextInput, faker.lorem.words(3));

		expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
	});

	it('should send the default fileAs value ("1") when creating a contact', async () => {
		populateFoldersStore();
		const handler = registerCreateContactHandler();
		const newName = faker.person.firstName();

		const { user } = setupTest(<EditView />);
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);

		expect(await handler.mock.lastCall?.[0].request.json()).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining({
						cn: expect.objectContaining({
							a: expect.arrayContaining([{ n: 'fileAs', _content: '1' }])
						})
					})
				}
			})
		);
	});

	it('should send the fileAs value composed as "8:<custom text>" when the custom option is used', async () => {
		populateFoldersStore();
		const handler = registerCreateContactHandler();
		const newName = faker.person.firstName();
		const customText = faker.lorem.words(3);

		const { user } = setupTest(<EditView />);
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		await user.type(inputName, newName);

		await user.click(screen.getByText('Select an option'));
		await user.click(screen.getByText('Custom'));
		const customTextInput = screen.getByRole('textbox', { name: /custom/i });
		await user.type(customTextInput, customText);

		await user.click(screen.getByRole('button', { name: /save/i }));
		await screen.findByText(/new contact created/i);

		expect(await handler.mock.lastCall?.[0].request.json()).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining({
						cn: expect.objectContaining({
							a: expect.arrayContaining([{ n: 'fileAs', _content: `8:${customText}` }])
						})
					})
				}
			})
		);
	});
});
