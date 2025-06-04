/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, getFolder, getFolderIdParts, getFoldersMap } from '@zextras/carbonio-ui-commons';

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
