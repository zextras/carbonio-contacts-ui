/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';

import { ContactGroup } from '../../../model/contact-group';
import { Contact, ContactOrGroup } from '../../types/contact';
import { State } from '../../types/store';

export function selectAllContactsInFolder(
	{ contacts }: State,
	id: string
): ContactOrGroup[] | undefined {
	return contacts?.contacts?.[id];
}

export function selectContact(
	{ contacts }: State,
	folderId: string,
	id: string
): Contact | undefined {
	return find(contacts?.contacts?.[folderId], ['id', id]) as Contact | undefined;
}

export function selectContactGroup(
	{ contacts }: State,
	folderId: string,
	id: string
): ContactGroup | undefined {
	return find(contacts?.contacts?.[folderId], ['id', id]) as ContactGroup | undefined;
}

export function selectContactsStatus({ contacts }: State, id: string): boolean | undefined {
	return contacts?.status?.[id];
}

export function selectFolderStatus({ contacts }: State, id: string): boolean | undefined {
	return contacts?.status?.[id];
}
