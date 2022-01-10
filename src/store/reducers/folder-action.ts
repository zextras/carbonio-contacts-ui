/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter, find, split } from 'lodash';
import { FoldersSlice } from '../../types/store';
import {
	removeContactsFromStore,
	removeFoldersFromStore,
	removeIndexFolderFromStore,
	updateFolderInStore
} from '../utils/helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionPending(state: any, { meta }: any): void {
	const { folder, l, op, name, color, zid } = meta.arg;
	if (state.contacts) {
		// eslint-disable-next-line no-param-reassign
		meta.arg.prevContactsState = cloneDeep(state.contacts);
		if (folder.cn) {
			switch (op) {
				case 'empty':
					if (folder.cn[0]) {
						removeContactsFromStore(state, split(folder.cn[0].ids, ','));
					}
					break;
				case 'delete':
					if (folder.id) {
						removeIndexFolderFromStore(state, folder.id);
					}
					break;
				case 'move':
				case 'rename':
					break;
				default:
					break;
			}
		}
	}
	if (state.folders) {
		const originFolder = find(state.folders, (item) => item.id === folder.id);
		// eslint-disable-next-line no-param-reassign
		meta.arg.prevFolderState = cloneDeep(state.folders);
		const newFolder = {
			...folder,
			parent: l,
			label: name || folder.label,
			color: color || folder.color
		};
		switch (op) {
			case 'move':
				state.folders = filter(state.folders, (f) => f.id !== newFolder.id).concat(newFolder);
				updateFolderInStore(state, [newFolder]);
				break;
			case 'delete':
				removeFoldersFromStore(state, [folder.id]);
				break;
			case 'rename':
				state.folders = filter(state.folders, (f) => f.id !== newFolder.id).concat(newFolder);
				updateFolderInStore(state, [newFolder]);
				break;

			case '!grant': {
				const newAcl = filter(folder.sharedWith.grant, (rights) => rights.zid !== zid);
				const updatedFolder = { ...newFolder, sharedWith: newAcl };
				state.folders = filter(state.folders, (f) => f.id !== newFolder.id).concat(updatedFolder);
				updateFolderInStore(state, [updatedFolder]);
				state.status = 'updating';

				break;
			}
			case 'update': {
				state.folders = filter(state.folders, (f) => f.id !== newFolder.id).concat(newFolder);
				updateFolderInStore(state, [newFolder]);
				break;
			}
			case 'empty':
				if (originFolder) {
					originFolder.itemsCount = 0;
					originFolder.cn[0] = { ids: '' };
				}
				state.folders = filter(state.folders, (item) => item.absParent !== '3');
				break;
			default:
				console.warn('Operation not handled', op);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function folderActionRejected(state: any, request: any): void {
	if (state.contacts) {
		const { prevContactsState } = request.meta.arg;
		state.contacts = prevContactsState;
	}
	if (state.folders) {
		state.folders = request.meta.arg.prevFolderState;
		state.status = 'failed';
	}
}

export function folderActionFulFilled(state: FoldersSlice): void {
	state.status = 'idle';
}
