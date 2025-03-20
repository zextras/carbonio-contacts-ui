/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { TFunction } from 'i18next';
import { reduce } from 'lodash';

import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { ContactGroup } from '../../model/contact-group';
import { ContactOrGroup, ContactsFolder } from '../types/contact';

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

export function isGroup(contact: ContactOrGroup): contact is ContactGroup {
	return (<ContactGroup>contact).members !== undefined;
}

export const evaluateParentIds = (contacts: ContactOrGroup[]): Array<string> =>
	contacts.map((contact) => contact.parent);

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
