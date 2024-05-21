/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { Route } from 'react-router-dom';

import EditView from './edit-view';
import { FOLDERS } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../tests/generators/store';
import { registerCreateContactHandler } from '../../tests/msw/create-contact';
import { CreateContactRequest } from '../../types/soap';

describe('Edit view', () => {
	it('should not show the destination folder select while editing a contact', () => {
		populateFoldersStore();
		const store = generateStore();
		const folderId = FOLDERS.CONTACTS;
		const contactId = faker.string.uuid();
		setupTest(
			<Route path={`/folder/:folderId/edit/:editId`}>
				<EditView />
			</Route>,
			{ store, initialEntries: [`/folder/${folderId}/edit/${contactId}`] }
		);
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
		expect(screen.queryByText('Destination address book')).not.toBeInTheDocument();
		expect(screen.queryByText('Address Book')).not.toBeInTheDocument();
	});

	it('should show the destination folder select while creating a contact', async () => {
		populateFoldersStore();
		const store = generateStore();
		setupTest(<EditView />, { store });
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();

		expect(screen.getByText('Destination address book')).toBeVisible();
		expect(screen.getByText('Address Book')).toBeVisible();
		expect(screen.getByText(/this contact will be created in the/i)).toBeVisible();
	});

	it('should create the new contact in the selected folder', async () => {
		const addressBook = generateFolder({ view: 'contact', id: faker.string.uuid() });
		populateFoldersStore({ customFolders: [addressBook] });
		const store = generateStore();
		const handler = registerCreateContactHandler();
		const newName = faker.person.firstName();
		const { user } = setupTest(<EditView />, {
			store
		});
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

	it('should create the new contact in the contact folder (parent 7) by default', async () => {
		populateFoldersStore();
		const handler = registerCreateContactHandler();
		const store = generateStore();
		const { user } = setupTest(<EditView />, { store });
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

	it('should save button enabled once after change anything in editing a contact', async () => {
		populateFoldersStore();
		const store = generateStore();
		const folderId = FOLDERS.CONTACTS;
		const contactId = faker.string.uuid();
		const { user } = setupTest(
			<Route path={`/folder/:folderId/edit/:editId`}>
				<EditView />
			</Route>,
			{ store, initialEntries: [`/folder/${folderId}/edit/${contactId}`] }
		);
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
