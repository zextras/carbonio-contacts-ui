/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, find, map } from 'lodash';
import { normalizeFolders } from '../normalizations/normalize-folders';
import {
	addFoldersToStore,
	removeContactsFromStore,
	removeFoldersFromStore,
	updateFolderInStore
} from '../utils/helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleFolderSyncReducer(state: any, { payload }: { payload: any }): void {
	const { created, modified, deleted } = payload;
	if (state.folders) {
		if (created?.folder) {
			addFoldersToStore(state, normalizeFolders(state, created.folder));
		}
		if (modified?.folder) {
			updateFolderInStore(state, normalizeFolders(state, modified?.folder));
		}
		if (deleted?.length > 0) {
			removeFoldersFromStore(state, deleted.split(','));
		}
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleContactSyncReducer(state: any, { payload }: { payload: any }): void {
	const { created, modified, deleted } = payload;
	if (state.contacts) {
		state.status.pendingActions = false;
		if (deleted?.length > 0) {
			removeContactsFromStore(state, deleted.split(','));
		}
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleRefreshReducer(state: any, { payload }: { payload: any }): void {
	const folders = [
		...filter(payload?.folder?.[0]?.folder, (f) => f.view === 'contact' || f.id === FOLDERS.TRASH),
		...filter(payload?.folder?.[0]?.link, (f) => f.view === 'contact' || f.id === FOLDERS.TRASH)
	];
	const normalized = normalizeFolders(state, folders);
	addFoldersToStore(state, normalized);
	updateFolderInStore(state, normalized);
}
