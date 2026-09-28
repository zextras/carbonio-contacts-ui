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
	it('should not show an error before the name fields are touched', () => {
		populateFoldersStore();
		setupTest(<EditView />);

		expect(screen.queryByText(/enter a first name or a last name/i)).not.toBeInTheDocument();
	});

	it('should show an error under first and last name once they are both left empty on blur', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		await user.click(firstNameInput);
		await user.tab();

		expect(await screen.findAllByText(/enter a first name or a last name/i)).toHaveLength(2);
	});

	it('should clear the error once a name is entered', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		await user.click(firstNameInput);
		await user.tab();
		await screen.findAllByText(/enter a first name or a last name/i);

		await user.type(firstNameInput, faker.person.firstName());

		expect(screen.queryByText(/enter a first name or a last name/i)).not.toBeInTheDocument();
	});

	it('should show the "<No Name>" placeholder when no name is provided', () => {
		populateFoldersStore();
		setupTest(<EditView />);

		expect(screen.getByText('<No Name>')).toBeVisible();
	});

	it('should hide the error again while the user is focused on fixing it', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		await user.click(firstNameInput);
		await user.tab();
		await screen.findAllByText(/enter a first name or a last name/i);

		await user.click(firstNameInput);

		expect(screen.queryByText(/enter a first name or a last name/i)).not.toBeInTheDocument();
	});

	it('should show the error again on blur if the fields are still both empty', async () => {
		populateFoldersStore();
		const { user } = setupTest(<EditView />);

		const firstNameInput = screen.getByRole('textbox', { name: /first name/i });
		await user.click(firstNameInput);
		await user.tab();
		await screen.findAllByText(/enter a first name or a last name/i);

		await user.click(firstNameInput);
		await user.tab();

		expect(await screen.findAllByText(/enter a first name or a last name/i)).toHaveLength(2);
	});

	it('should show the error immediately when an existing contact is missing both names', async () => {
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
				company: faker.company.name()
			}
		]);

		setupTest(<EditView />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			path: 'folder/:folderId/edit/:editId'
		});

		expect(await screen.findAllByText(/enter a first name or a last name/i)).toHaveLength(2);
	});
});
