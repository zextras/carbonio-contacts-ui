/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { getFolder, getFoldersMap } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types';

// return the folder based on the item parent from the folders store. Checks for link folders also
export function getParentFolder(item: { parent: string }): Folder | undefined {
	const foldersMap = getFoldersMap();
	const currentFolder = getFolder(item.parent);
	if (!currentFolder) {
		const { zid, id: realFolderId } = getFolderIdParts(item.parent);
		return (
			Object.values(foldersMap)
				.filter((folder) => folder.isLink)
				// TODO: fix type in commons, we are receiving a number instead of a string
				.find((folder) => folder.zid === zid && folder.rid?.toString() === realFolderId)
		);
	}
	return currentFolder;
}
