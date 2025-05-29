/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import EditView from './edit-view';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { registerCreateContactHandler } from '../../tests/msw/create-contact';
import { CreateContactRequest } from '../../types/soap';
import { populateFoldersStore } from '@test-utils/store/folders';
import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';

describe('Edit view', () => {
	it('should not show the destination folder select while editing a contact', () => {
		populateFoldersStore();

		const folderId = FOLDERS.CONTACTS;
		const contactId = faker.string.uuid();
		setupTest(<EditView />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			path: 'folder/:folderId/edit/:editId'
		});
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
		expect(screen.queryByText('Destination address book')).not.toBeInTheDocument();
		expect(screen.queryByText('Address Book')).not.toBeInTheDocument();
	});

	it('should show the destination folder select while creating a contact', async () => {
		populateFoldersStore();

		setupTest(<EditView />);
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();

		expect(screen.getByText('Destination address book')).toBeVisible();
		expect(screen.getByText('Address Book')).toBeVisible();
		expect(screen.getByText(/this contact will be created in the/i)).toBeVisible();
	});

	it('should create the new contact in the selected folder', async () => {
		const addressBook = generateFolder({ view: 'contact', id: faker.string.uuid() });
		populateFoldersStore({ customFolders: [addressBook] });

		const handler = registerCreateContactHandler();
		const newName = faker.person.firstName();
		const { user } = setupTest(<EditView />);
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(screen.getByText('Destination address book')).toBeVisible();
		expect(screen.getByText('Address Book')).toBeVisible();
		await user.click(screen.getByText('Contacts'));
		await user.click(await screen.findByText(addressBook.name));
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);
		expect(await handler.mock.lastCall?.[0].request.json()).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining<Partial<CreateContactRequest>>({
						cn: expect.objectContaining({ l: addressBook.id })
					})
				}
			})
		);
	});

	it('should call the onTitleChanged callback if the title is changed', async () => {
		populateFoldersStore();
		const firstName = faker.person.firstName();

		const onTitleChanged = jest.fn();
		const { user } = setupTest(<EditView onTitleChanged={onTitleChanged} />);
		const inputName = await screen.findByRole('textbox', { name: /first name/i });
		await act(async () => user.type(inputName, firstName));
		expect(onTitleChanged).toHaveBeenCalled();
	});

	it('should create the new contact in the contact folder (parent 7) by default', async () => {
		populateFoldersStore();
		const handler = registerCreateContactHandler();

		const { user } = setupTest(<EditView />);
		const newName = faker.person.firstName();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(inputName).toBeVisible();
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);
		// by default the selected folder is 7
		expect(await handler.mock.lastCall?.[0].request.json()).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining<Partial<CreateContactRequest>>({
						cn: expect.objectContaining({ l: '7' })
					})
				}
			})
		);
	});

	it('should call the onClose callback if the contacts is successfully saved', async () => {
		populateFoldersStore();
		registerCreateContactHandler();

		const onClose = jest.fn();
		const { user } = setupTest(<EditView onClose={onClose} />);
		const newName = faker.person.firstName();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(inputName).toBeVisible();
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);
		expect(onClose).toHaveBeenCalled();
	});

	it('should save button enabled once after change anything in editing a contact', async () => {
		populateFoldersStore();

		const folderId = FOLDERS.CONTACTS;
		const contactId = faker.string.uuid();
		const { user } = setupTest(<EditView />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			path: 'folder/:folderId/edit/:editId'
		});
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(saveButton).toBeVisible();
		expect(saveButton).toBeDisabled();

		const newName = faker.person.firstName();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		expect(inputName).toBeVisible();
		await user.type(inputName, newName);
		expect(saveButton).toBeEnabled();
	});
});
