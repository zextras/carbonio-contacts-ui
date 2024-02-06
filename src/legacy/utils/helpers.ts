/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, FOLDERS } from '@zextras/carbonio-shell-ui';
import type { TFunction } from 'i18next';
import { cloneDeep, filter, find, forEach, map, merge, reduce, reject, some } from 'lodash';

import { Contact, ContactsFolder } from '../types/contact';
import { ContactsSlice, FoldersSlice } from '../types/store';

const folderIdRegex = /^(.+:)*(\d+)$/;

export function extractFolders(accordions: ContactsFolder[]): ContactsFolder[] {
	return reduce(
		accordions,
		(acc, v) => {
			if (v && v.items && v.items.length) {
				return [...acc, v, ...extractFolders(v.items)];
			}
			return [...acc, v];
		},
		[] as ContactsFolder[]
	);
}

export function removeFoldersFromStore(
	state: FoldersSlice,
	idsToDelete?: Array<string | undefined>
): void {
	state.folders = reduce(
		state.folders,
		(acc, v) => {
			const value = some(idsToDelete, (cid) => cid === v.id);
			return value ? [...acc] : [...acc, v];
		},
		[] as ContactsFolder[]
	);
}

export const applyFoldersChangesToStore = (
	state: FoldersSlice,
	folders: ContactsFolder[]
): void => {
	forEach(folders, (f) => {
		const isFolderInStore = find(state.folders, ['id', f.id]);
		if (isFolderInStore) {
			merge(isFolderInStore, f);
		} else {
			state.folders = [...state.folders, f];
		}
	});
};

export function addFoldersToStore(state: FoldersSlice, folders: ContactsFolder[]): void {
	if (folders && folders.length) {
		const isFolderAvailable = state.folders?.find((item) => item.id === folders[0].id);
		if (isFolderAvailable === undefined) {
			state.folders = reduce(folders, (acc, v) => [...acc, v], state.folders);
		}
	}
}

export function updateContactsInStore(state: ContactsSlice, contactsArray: Contact[]): void {
	state.contacts = reduce(
		state.contacts,
		(acc, v, k) => ({
			...acc,
			[k]: reduce(
				v,
				(acc2, v2) =>
					reduce(
						contactsArray,
						(acc3, v3) => (v3.id === v2.id ? [...acc3, v3] : [...acc3, v2]),
						acc2
					),
				[] as Contact[]
			)
		}),
		{}
	);
}

export function findContactsInStore(state: ContactsSlice, ids: Array<string>): Array<Contact> {
	return reduce(
		ids,
		(acc, id) =>
			reduce(
				state.contacts,
				(acc2, v2) => {
					const contactInStore = find(v2, (item) => item.id === id);
					if (contactInStore) {
						return [...acc2, cloneDeep(contactInStore)];
					}
					return acc2;
				},
				acc
			),
		[] as any
	);
}

export function removeContactsWithoutID(state: ContactsSlice): void {
	map(state.contacts, (v) => reject(v, (item) => !item.id));
}

export function removeContactsFromStore(
	state: ContactsSlice,
	idsToDelete?: Array<string | undefined>
): void {
	state.contacts = reduce(
		state.contacts,
		(acc, v, k) =>
			idsToDelete
				? {
						...acc,
						[k]: filter(v, (contact) => !some(idsToDelete, (id) => id === contact.id))
				  }
				: {
						...acc,
						[k]: filter(v, (contact) => (contact.id ? contact : false))
				  },
		{}
	);
}

export function addContactsToStore(
	state: ContactsSlice,
	contacts: Contact[],
	sharedFolderParent?: string
): void {
	reduce(
		contacts,
		(acc, v) => {
			if (!acc[sharedFolderParent ?? v.parent]) {
				// eslint-disable-next-line no-param-reassign
				acc[sharedFolderParent ?? v.parent] = [];
			}
			acc[sharedFolderParent ?? v.parent].push(v);
			return acc;
		},
		state.contacts
	);
}

export const getSystemFoldersTranslatedName = (t: TFunction): Array<string> => [
	t('folders.root', 'Root'),
	t('folders.contacts', 'Contacts'),
	t('folders.auto_contacts', 'Emailed Contacts'),
	t('folders.trash', 'Trash')
];

export const getFolderTranslatedName = (
	t: TFunction,
	folderId: string,
	folderName: string
): string => {
	const id = folderIdRegex.exec(folderId ?? '')?.[2];
	let translationKey;
	switch (id) {
		case FOLDERS.USER_ROOT:
			translationKey = 'root';
			break;
		case FOLDERS.CONTACTS:
			translationKey = 'contacts';
			break;
		case FOLDERS.AUTO_CONTACTS:
			translationKey = 'auto_contacts';
			break;
		case FOLDERS.TRASH:
			translationKey = 'trash';
			break;
		default:
			return folderName;
	}

	return t(`folders.${translationKey}`, folderName);
};

export const getFolderTranslatedNameByName = (t: TFunction, folderName: string): string => {
	let translationKey;
	switch (folderName) {
		case 'Root':
			translationKey = 'root';
			break;
		case 'Contacts':
			translationKey = 'contacts';
			break;
		case 'Emailed Contacts':
			translationKey = 'auto_contacts';
			break;
		case 'Trash':
			translationKey = 'trash';
			break;
		default:
			return folderName;
	}

	return t(`folders.${translationKey}`, folderName);
};

export const translateFoldersNames = (t: TFunction, folders: Folder[]): Folder[] =>
	folders.map((folder: Folder) => ({
		...folder,
		name: getFolderTranslatedName(t, folder.id, folder.name)
	}));
