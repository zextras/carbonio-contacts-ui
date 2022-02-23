/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { FoldersSlice } from '../../types/store';
import { extractFolders, normalizeFolders } from '../../utils/normalizations/normalize-folders';
import {
	addFoldersToStore,
	applyFoldersChangesToStore,
	removeFoldersFromStore
} from '../../utils/helpers';

export function handleFolderSyncReducer(state: FoldersSlice, { payload }: { payload: any }): void {
	const { created, modified, deleted } = payload;
	if (state.folders) {
		if (created?.folder) {
			applyFoldersChangesToStore(state, normalizeFolders(created.folder));
		}
		if (modified?.folder) {
			applyFoldersChangesToStore(state, normalizeFolders(modified?.folder));
		}
		if (deleted?.id) {
			const ids = deleted.id.split(',');
			removeFoldersFromStore(state, ids);
		}
	}
}

export function handleRefreshReducer(state: FoldersSlice, { payload }: { payload: any }): void {
	const folders = [
		...filter(payload?.folder?.[0]?.folder, (f) => f.view === 'contact' || f.id === FOLDERS.TRASH),
		...filter(payload?.folder?.[0]?.link, (f) => f.view === 'contact' || f.id === FOLDERS.TRASH)
	];
	const extracted = extractFolders(folders);
	const normalized = normalizeFolders(extracted);
	addFoldersToStore(state, normalized);
	applyFoldersChangesToStore(state, normalized);
}
