/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* NOTE
 * parent may be the folderId or the mountpointId in format remoteUuid:remoteId in case of shared folder
 *
 * */
export type ContactGroup = {
	title: string;
	id: string;
	parent: string;
	members: Array<string>;
	tags?: string[];
};
