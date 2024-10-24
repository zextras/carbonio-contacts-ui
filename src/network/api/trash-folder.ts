/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { folderAction } from './folder-action';

export const trashFolder = (folderId: string): Promise<void> =>
	folderAction({ folderId, operation: 'trash' });
