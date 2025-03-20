/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import { find, forEach, merge, reduce, some } from 'lodash';

import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { ContactGroup } from '../../model/contact-group';
import { ContactOrGroup, ContactsFolder } from '../types/contact';
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

export function isGroup(contact: ContactOrGroup): contact is ContactGroup {
	return (<ContactGroup>contact).members !== undefined;
}

export const evaluateParentIds = (contacts: ContactOrGroup[]): Array<string> =>
	contacts.map((contact) => contact.parent);

export function addContactsToStore(
	state: ContactsSlice,
	contacts: ContactOrGroup[],
	sharedFolderParent?: string
): void {
	reduce(
		contacts,
		(acc, contact) => {
			const parentKey = sharedFolderParent ?? contact.parent;
			if (!acc[parentKey]) {
				// eslint-disable-next-line no-param-reassign
				acc[parentKey] = [];
			}

			if (!acc[parentKey].some((existingContact) => existingContact.id === contact.id)) {
				acc[parentKey].push(contact);
			}

			return acc;
		},
		state.contacts
	);
}

export const getFolderTranslatedName = (
	t: TFunction,
	folderId: string,
	folderName: string
): string => {
	const id = folderIdRegex.exec(folderId ?? '')?.[2];
	let translationKey;
	switch (id) {
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
