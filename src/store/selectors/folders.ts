/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find } from 'lodash';
import { FoldersSlice } from '../../types/store';
import { ContactsFolder } from '../../types/contact';

export function selectFolder(state: { folders: FoldersSlice }, id: string): ContactsFolder {
	return find(state.folders.folders, (item) => item.id === id) as ContactsFolder;
}

export function selectFolders(state: { folders: FoldersSlice }): ContactsFolder[] {
	return state.folders ? state.folders.folders : [];
}

export function selectFoldersStatus(state: { folders: FoldersSlice }): string {
	return state.folders.status;
}
