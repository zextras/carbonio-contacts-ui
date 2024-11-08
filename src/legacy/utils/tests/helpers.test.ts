/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Contact } from '../../types/contact';
import { ContactsSlice } from '../../types/store';
import { addContactsToStore } from '../helpers';

describe('addContactsToStore', () => {
	let initialState: ContactsSlice;

	beforeEach(() => {
		initialState = {
			status: {},
			contacts: {},
			searchedInFolder: {}
		};
	});

	const createContact = (id: string, parent: string): Contact => ({
		id,
		parent,
		firstName: 'John',
		middleName: '',
		lastName: 'Doe',
		nickName: 'Johnny',
		displayName: 'John Doe',
		address: {},
		company: 'Test Company',
		department: 'Testing',
		email: {},
		image: '',
		jobTitle: 'Tester',
		notes: '',
		phone: {},
		nameSuffix: '',
		namePrefix: 'Mr.',
		URL: {},
		fileAsStr: 'Doe, John'
	});

	it('should add contacts under the correct parent key', () => {
		const contacts = [createContact('1', 'folder1'), createContact('2', 'folder1')];

		addContactsToStore(initialState, contacts);

		expect(initialState.contacts.folder1).toEqual(contacts);
	});

	it('should add contacts under sharedFolderParent if specified', () => {
		const contacts = [createContact('1', 'folder1'), createContact('2', 'folder1')];

		addContactsToStore(initialState, contacts, 'sharedFolder');

		expect(initialState.contacts.sharedFolder).toEqual(contacts);
	});

	it('should prevent duplicate contacts based on id', () => {
		const contacts = [createContact('1', 'folder1'), createContact('2', 'folder1')];

		addContactsToStore(initialState, contacts);
		addContactsToStore(initialState, contacts);

		expect(initialState.contacts.folder1).toEqual(contacts);
		expect(initialState.contacts.folder1).toHaveLength(2); // Length should be 2, not 4
	});

	it('should add new contacts without affecting existing contacts under the same parent key', () => {
		const initialContacts = [createContact('1', 'folder1')];
		const newContacts = [createContact('2', 'folder1')];

		addContactsToStore(initialState, initialContacts);
		addContactsToStore(initialState, newContacts);

		expect(initialState.contacts.folder1).toEqual([...initialContacts, ...newContacts]);
	});

	it('should add new contacts without affecting other parent keys', () => {
		const folder1Contacts = [createContact('1', 'folder1')];
		const folder2Contacts = [createContact('2', 'folder2')];

		addContactsToStore(initialState, folder1Contacts);
		addContactsToStore(initialState, folder2Contacts);

		expect(initialState.contacts.folder1).toEqual(folder1Contacts);
		expect(initialState.contacts.folder2).toEqual(folder2Contacts);
	});
});
