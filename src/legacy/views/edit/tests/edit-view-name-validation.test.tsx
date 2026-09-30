/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { addContactsToStore } from 'legacy/store/contacts';
import EditView from 'legacy/views/edit/edit-view';

describe('Edit view - Name validation', () => {
	it('should mark the first name field as required and the last name field as optional', () => {
		populateFoldersStore();
		setupTest(<EditView />);

		expect(screen.getByRole('textbox', { name: /first name\*/i })).toBeVisible();
		expect(screen.queryByRole('textbox', { name: /last name\*/i })).not.toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: /^last name$/i })).toBeVisible();
	});

	it('should disable the save button when the first name is empty', () => {
		populateFoldersStore();
		setupTest(<EditView />);

		expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
	});

	it('should enable the save button once a first name is entered, even without a last name', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		await user.type(firstNameInput, faker.person.firstName());

		expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
	});

	it('should keep the save button disabled when only a last name is entered', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const lastNameInput = screen.getByRole('textbox', { name: /last name/i });
		await user.type(lastNameInput, faker.person.lastName());

		expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
	});

	it('should show the "<No Name>" placeholder when no name is provided', () => {
		populateFoldersStore();
		setupTest(<EditView />);

		expect(screen.getByText('<No Name>')).toBeVisible();
	});

	it('should disable the save button when an existing contact is missing the first name', async () => {
		populateFoldersStore();
		const folderId = FOLDERS.CONTACTS;
		const contactId = faker.string.uuid();
		addContactsToStore([
			{
				id: contactId,
				parent: folderId,
				URL: {},
				address: {},
				email: {},
				phone: {},
				company: faker.company.name(),
				firstName: '',
				middleName: '',
				lastName: faker.person.lastName(),
				nickName: '',
				department: '',
				image: '',
				jobTitle: '',
				notes: '',
				nameSuffix: '',
				namePrefix: '',
				fileAsStr: ''
			}
		]);

		setupTest(<EditView />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			path: 'folder/:folderId/edit/:editId'
		});

		expect(await screen.findByRole('button', { name: /save/i })).toBeDisabled();
	});
});
