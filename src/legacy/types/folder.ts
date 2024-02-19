/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const FolderActionsType = {
	NEW: 'new',
	MOVE: 'move',
	DELETE: 'delete',
	EDIT: 'edit',
	EMPTY: 'empty',
	REMOVE_FROM_LIST: 'removeFromList',
	RESTORE: 'restore',
	SHARE_INFO: 'sharesInfo',
	SHARE: 'share',
	IMPORT_CONTACTS: 'importContacts',
	EXPORT_CONTACTS: 'exportContacts'
} as const;
