/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import produce from 'immer';
import { create } from 'zustand';

import { ContactOrGroup } from '../types/contact';

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

export const useContactsById = (contactIds: Array<string>): Array<ContactOrGroup> => {
	const { contacts } = useContactsStore.getState();
	return contactIds.map((id) => contacts[id]).filter(Boolean);
};
