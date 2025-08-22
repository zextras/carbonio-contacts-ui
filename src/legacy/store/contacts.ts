/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder } from '@zextras/carbonio-ui-commons';
import produce, { enableMapSet } from 'immer';
import { create } from 'zustand';

import { ContactGroup } from 'model/contact-group';
import { Contact, ContactOrGroup } from 'legacy/types/contact';

type ContactsStoreState = {
	contacts: Record<string, ContactOrGroup>;
	currentFolderViewList: Set<string>;
};
const useContactsStore = create<ContactsStoreState>()(() => ({
	contacts: {},
	currentFolderViewList: new Set([])
}));

enableMapSet();

export const addContactsToStore = (contacts: Array<ContactOrGroup>): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			contacts.forEach((contact) => {
				state.contacts[contact.id] = contact;
				state.currentFolderViewList.add(contact.id);
			});
		})
	);
};

export const setContactsInStore = (contacts: Array<ContactOrGroup>): void => {
	useContactsStore.setState(
		produce((state: ContactsStoreState) => {
			const newContacts = {} as Record<string, ContactOrGroup>;
			const newSet = new Set<string>([]);
			contacts.forEach((contact) => {
				newContacts[contact.id] = contact;
				newSet.add(contact.id);
			});
			state.contacts = newContacts;
			state.currentFolderViewList = newSet;
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
				state.currentFolderViewList.delete(contactId);
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

export const useContactsByFolder = (folder: Folder): Array<ContactOrGroup> => {
	const parent = folder.isLink ? `${folder.zid}:${folder.rid}` : folder?.id;
	return useContactsStore(({ contacts, currentFolderViewList }) =>
		Array.from(currentFolderViewList)
			.map((key: string) => contacts[key])
			.filter((contact) => contact.parent === parent)
	);
};
