/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { Route } from 'react-router-dom';

import EditView from './edit-view';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../tests/generators/store';
import { registerCreateContactHandler } from '../../tests/msw/create-contact';
import { CreateContactRequest } from '../../types/soap';
import { State } from '../../types/store';

describe('Edit view', () => {
	it('should not show the destination folder select while editing a contact', () => {
		const store = generateStore();
		const folderId = faker.string.uuid();
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
		const store = generateStore();
		setupTest(<EditView />, { store });
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();

		expect(screen.getByText('Destination address book')).toBeVisible();
		expect(screen.getByText('Address Book')).toBeVisible();
		expect(screen.getByText(/this contact will be created in the/i)).toBeVisible();
	});

	it('should create the new contact in the selected folder', async () => {
		const folderId = faker.string.uuid();
		const nameFolder1 = faker.string.alpha(10);
		const nameFolder2 = faker.string.alpha(10);
		const preloadedState: Partial<State> = {
			folders: {
				status: '',
				folders: [
					{
						items: [],
						id: faker.string.uuid(),
						itemsCount: faker.number.int(),
						path: faker.string.alpha(),
						parent: faker.string.alpha(),
						label: nameFolder1,
						deletable: faker.datatype.boolean(),
						view: faker.string.alpha(),
						color: 1,
						isShared: false,
						sharedWith: faker.string.uuid(),
						perm: faker.string.uuid()
					},
					{
						items: [],
						id: folderId,
						itemsCount: faker.number.int(),
						path: faker.string.alpha(),
						parent: faker.string.alpha(),
						label: nameFolder2,
						deletable: faker.datatype.boolean(),
						view: faker.string.alpha(),
						color: 1,
						isShared: false,
						sharedWith: faker.string.uuid(),
						perm: faker.string.uuid()
					}
				]
			}
		};
		const store = generateStore(preloadedState);
		const handler = registerCreateContactHandler();
		const newName = faker.person.firstName();
		const { user } = setupTest(<EditView />, {
			store
		});
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(screen.getByText('Destination address book')).toBeVisible();
		expect(screen.getByText('Address Book')).toBeVisible();
		await user.click(screen.getByText(nameFolder1));
		await user.click(await screen.findByText(nameFolder2));
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);
		expect(handler.mock.lastCall?.[0].body).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining<Partial<CreateContactRequest>>({
						cn: expect.objectContaining({ l: folderId })
					})
				}
			})
		);
	});

	it('should create the new contact in the contact folder (parent 7) by default', async () => {
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
		expect(handler.mock.lastCall?.[0].body).toEqual(
			expect.objectContaining({
				Body: {
					CreateContactRequest: expect.objectContaining<Partial<CreateContactRequest>>({
						cn: expect.objectContaining({ l: '7' })
					})
				}
			})
		);
	});
});
