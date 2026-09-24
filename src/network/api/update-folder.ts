/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { folderAction } from 'network/api/folder-action';

export type UpdateFolderParams = {
	folderId: string;
	name?: string;
	parentId?: string;
	color?: number;
	rgb?: string;
};

export const updateFolder = ({
	folderId,
	name,
	parentId,
	color,
	rgb
}: UpdateFolderParams): Promise<void> =>
	folderAction({
		folderId,
		name,
		parentId,
		color,
		rgb,
		operation: 'update'
	});
