/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { folderAction } from './folder-action';

export type UpdateFolderParams = {
	folderId: string;
	name?: string;
	parentId?: string;
	color?: number;
};

export const updateFolder = ({
	folderId,
	name,
	parentId,
	color
}: UpdateFolderParams): Promise<void> =>
	folderAction({
		folderId,
		name,
		parentId,
		color,
		operation: 'update'
	});
