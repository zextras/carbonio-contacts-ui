/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep } from 'lodash';
import { FoldersSlice } from '../../types/store';
import { addFoldersToStore, removeFoldersFromStore } from '../../utils/helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createFolderPending(state: any, { meta }: any): void {
	const { parentFolder, name, id } = meta.arg;
	// eslint-disable-next-line no-param-reassign
	meta.arg.prevState = cloneDeep(state.folders);
	const folder = [
		{
			itemsCount: 0,
			id,
			path: '',
			items: [],
			parent: parentFolder.id,
			label: name,
			deletable: true,
			view: 'contact',
			to: undefined,
			color: 0,
			isShared: false,
			sharedWith: {},
			perm: ''
		}
	];
	addFoldersToStore(state, folder);
	state.status = 'adding';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createFolderFulFilled(state: FoldersSlice, { meta }: any): void {
	removeFoldersFromStore(state, [meta.arg.id]);
	state.status = 'idle';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createFolderRejected(state: FoldersSlice, { meta }: any): void {
	state.folders = meta.arg.prevState;
	state.status = 'failed';
}
