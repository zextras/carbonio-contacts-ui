/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// NOTE: in case of shared account the id is accountId:itemId and folderId is accountId:folderId so there is no collision
export type ContactGroup = {
	title: string;
	id: string;
	folderId: string;
	members: Array<string>;
};
