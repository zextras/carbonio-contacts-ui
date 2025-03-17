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

type PartialContactWithId = Partial<ContactOrGroup> & { id: string };
export const updateContactsInStore = (contacts: Array<PartialContactWithId>): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			contacts.forEach((partialContact) => {
				const existingContact = state.contacts[partialContact.id];
				// see old code at: https://github.com/zextras/carbonio-contacts-ui/blob/95e9ddde7ef5b70105cb71e4c4c6dc8a492bc9a6/src/legacy/store/reducers/handle-contacts-sync.ts#L50
				state.contacts[partialContact.id] = { ...existingContact, ...partialContact };
			});
		})
	);
};

export const removeContactsFromStore = (contactIds: Array<string>): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			contactIds.forEach((contactId) => {
				delete state.contacts[contactId];
			});
		})
	);
};

export const updateContactsParent = (
	contactsWithParent: Array<{ id: string; newParent: string }>
): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			contactsWithParent.forEach((contact) => {
				const existingContact = state.contacts[contact.id];
				existingContact.parent = contact.newParent;
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
