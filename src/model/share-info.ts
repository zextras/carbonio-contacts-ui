/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ShareInfo = {
	folderId: string;
	folderPath: string;
	folderUuid: string;
	granteeType: string;
	ownerEmail: string;
	ownerId: string;
	ownerName?: string;
	rights: string;
};
