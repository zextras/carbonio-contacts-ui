/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getFolderIdParts, getFolder, getFoldersMap, Folder } from '@zextras/carbonio-ui-commons';

import { ContactGroup } from 'model/contact-group';

export function getFolderFromContactGroup(contactGroup: ContactGroup): Folder | undefined {
	const foldersMap = getFoldersMap();
	const { zid, id: realFolderId } = getFolderIdParts(contactGroup.parent);
	let folder = getFolder(contactGroup.parent);
	if (!folder) {
		folder = Object.values(foldersMap)
			.filter((item) => item.isLink)
			// TODO: fix type in commons, we are receiving a number instead of a string
			.find((item) => item.zid === zid && item.rid?.toString() === realFolderId);
	}
	return folder;
}

export function getFolderFromParent({ parent }: { parent: string }): Folder | undefined {
	const foldersMap = getFoldersMap();
	const { zid, id: remoteFolderId } = getFolderIdParts(parent);
	let folder = getFolder(parent);
	if (!folder) {
		folder = Object.values(foldersMap)
			.filter((item) => item.isLink)
			// TODO: fix type in commons, we are receiving a number instead of a string
			.find((item) => item.zid === zid && item.rid?.toString() === remoteFolderId);
	}
	return folder;
}
