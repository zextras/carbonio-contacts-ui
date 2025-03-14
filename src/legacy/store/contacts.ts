/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import produce from 'immer';
import { create } from 'zustand';

import { ContactGroup } from '../../model/contact-group';
import { Contact, ContactOrGroup } from '../types/contact';

type ContactsStoreState = {
	contacts: Record<string, ContactOrGroup>;
};
const useContactsStore = create<ContactsStoreState>()(() => ({
	contacts: {}
}));

export const addContactsToStore = (contacts: Array<ContactOrGroup>): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			contacts.forEach((contact) => {
				state.contacts[contact.id] = contact;
			});
		})
	);
};

export const useContactsById = (contactIds: Array<string>): Array<ContactOrGroup> =>
	useContactsStore(({ contacts }) => contactIds.map((id) => contacts[id]).filter(Boolean));

export const useContactGroupById = (contactGroupId: string): ContactGroup | undefined =>
	useContactsStore(({ contacts }) => {
		const exists = contacts[contactGroupId];
		if (exists && 'members' in exists) {
			return exists;
		}
		return undefined;
	});

export const useContactById = (contactId: string): Contact | undefined =>
	useContactsStore(({ contacts }) => {
		const exists = contacts[contactId];
		if (exists && !('members' in exists)) {
			return exists;
		}
		return undefined;
	});

export const useContactsByFolderId = (folderId: string): Array<ContactOrGroup> =>
	useContactsStore(({ contacts }) => {
		const allKeys = Object.keys(contacts);
		return allKeys
			.map((key: string) => contacts[key])
			.filter((contact) => contact.parent === folderId);
	});

export const useContactsStoreForTesting = useContactsStore;
