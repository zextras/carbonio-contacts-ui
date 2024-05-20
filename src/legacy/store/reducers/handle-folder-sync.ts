/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter } from 'lodash';

import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { FoldersSlice } from '../../types/store';
import {
	addFoldersToStore,
	applyFoldersChangesToStore,
	removeFoldersFromStore
} from '../../utils/helpers';
import { extractFolders, normalizeFolders } from '../../utils/normalizations/normalize-folders';

export function handleFolderSyncReducer(state: FoldersSlice, { payload }: { payload: any }): void {
	const { created, modified, deleted } = payload;
	const modsFolders = filter(modified?.folder, ['view', 'contact']);
	const createdFolders = filter(created?.folder, ['view', 'contact']);
	if (state.folders) {
		if (createdFolders?.length) {
			applyFoldersChangesToStore(state, normalizeFolders(createdFolders));
		}
		if (modsFolders?.length) {
			applyFoldersChangesToStore(state, normalizeFolders(modsFolders));
		}
		if (deleted?.length > 0) {
			removeFoldersFromStore(state, deleted);
		}
	}
}

export function handleRefreshReducer(state: FoldersSlice, { payload }: { payload: any }): void {
	const folders = [
		...filter(payload?.folder?.[0]?.folder, (f) => f.view === 'contact' || isTrash(f.id)),
		...filter(payload?.folder?.[0]?.link, (f) => f.view === 'contact' || isTrash(f.id))
	];
	const extracted = extractFolders(folders);
	const normalized = normalizeFolders(extracted);
	addFoldersToStore(state, normalized);
	applyFoldersChangesToStore(state, normalized);
}
