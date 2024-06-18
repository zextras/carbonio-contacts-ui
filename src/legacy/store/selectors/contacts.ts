/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';

import { Contact } from '../../types/contact';
import { State } from '../../types/store';

export function selectAllContacts({
	contacts
}: State): { [p: string]: Array<Contact> } | undefined {
	return contacts?.contacts;
}

export function selectAllContactsInFolder({ contacts }: State, id: string): Contact[] | undefined {
	return contacts?.contacts?.[id];
}

export function selectContact(
	{ contacts }: State,
	folderId: string,
	id: string
): Contact | undefined {
	return find(contacts?.contacts?.[folderId], ['id', id]);
}

export function selectContactsStatus({ contacts }: State, id: string): boolean | undefined {
	return contacts?.status?.[id];
}

export function selectFolderStatus({ contacts }: State, id: string): boolean | undefined {
	return contacts?.status?.[id];
}
