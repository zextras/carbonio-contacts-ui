/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { getFolder, getFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types';
import { ContactGroup } from '../../../model/contact-group';

export function getFolderFromContactGroup(contactGroup: ContactGroup): Folder | undefined {
	const foldersMap = getFoldersMap();
	const { id: realFolderId } = getFolderIdParts(contactGroup.folderId);
	let folder = getFolder(contactGroup.folderId);
	if (!folder) {
		folder = Object.values(foldersMap)
			.filter((item) => item.isLink)
			// TODO: fix type in commons, we are receiving a number instead of a string
			.find((item) => item.rid?.toString() === realFolderId);
	}
	return folder;
}
