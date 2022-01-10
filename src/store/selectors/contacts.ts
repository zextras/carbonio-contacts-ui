/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Contact } from '../../types/contact';
import { State } from '../../types/store';

export function selectAllContactsInFolder({ contacts }: State, id: string): Contact[] | undefined {
	if (contacts && contacts.contacts[id]) {
		return contacts.contacts[id];
	}
	return undefined;
}

export function selectContact(
	{ contacts }: State,
	folderId: number,
	id: string
): Contact | undefined {
	if (contacts && contacts.contacts[folderId]) {
		return contacts.contacts[folderId].find((item) => item.id === id);
	}
	return undefined;
}

export function selectContactsStatus({ contacts }: State, id: string): boolean | undefined {
	if (contacts && contacts.status[id]) {
		return contacts.status[id];
	}
	return undefined;
}

export function selectFolderStatus({ contacts }: State, id: string): boolean | undefined {
	if (contacts && contacts.status[id]) {
		return contacts.status[id];
	}
	return undefined;
}
