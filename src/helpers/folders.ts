/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { sortBy } from 'lodash';

import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { ZIMBRA_STANDARD_COLORS } from '../carbonio-ui-commons/constants/utils';
import { getFolderIdParts, isA, isLink, isRoot } from '../carbonio-ui-commons/helpers/folders';
import type { Folder } from '../carbonio-ui-commons/types/folder';

/**
 * Tells if a folder with the given id is the Contacts folder
 * @param folderId
 */
export const isContacts = (folderId: string): boolean => isA(folderId, FOLDERS.CONTACTS);

/**
 * Tells if a folder with the given id is the "Emailed Contacts" folder
 * @param folderId
 */
export const isEmailedContacts = (folderId: string): boolean =>
	isA(folderId, FOLDERS.AUTO_CONTACTS);

export const getSortCriteria = (folder: Folder): string => {
	const { id, zid } = getFolderIdParts(folder.id);

	if (isRoot(folder.id)) {
		return zid === null ? `0100` : `0500-${folder.name.toLowerCase()}`;
	}

	if (isLink(folder)) {
		return `5000-${folder.name.toLowerCase()}`;
	}

	switch (id) {
		case FOLDERS.CONTACTS:
			return `1000`;
		case FOLDERS.AUTO_CONTACTS:
			return `2000`;
		case FOLDERS.TRASH:
			return `4000`;
		default:
			return `3000-${folder.name.toLowerCase()}`;
	}
};

/**
 * recursively sort the children of a folder according to a given sort function
 * @param folders
 * @param sortFunction
 * @returns the sorted children
 */
export const sortFolders = (
	folders: Array<Folder>,
	sortFunction?: (folder: Folder) => string
): Folder[] => {
	const childrenSorted = sortBy(folders, sortFunction ?? getSortCriteria);
	return childrenSorted.map((folder) => ({
		...folder,
		children: sortFolders(folder.children, sortFunction)
	}));
};

export const getFolderIconName = (folder: Folder): string | null => {
	const { id } = getFolderIdParts(folder.id);
	if (id && isRoot(id)) {
		return null;
	}

	switch (id) {
		case FOLDERS.CONTACTS:
			return 'PersonOutline';
		case FOLDERS.AUTO_CONTACTS:
			return 'EmailOutline';
		case FOLDERS.TRASH:
			return 'Trash2Outline';
		default:
			return 'FolderOutline';
	}
};

export const getFolderIconColor = (folder: Folder): string =>
	folder.color ? ZIMBRA_STANDARD_COLORS[folder.color].hex : ZIMBRA_STANDARD_COLORS[0].hex;
