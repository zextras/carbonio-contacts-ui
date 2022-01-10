/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter, find, map, max, reduce, some, split } from 'lodash';
import { Contact, ContactsFolder } from '../../types/contact';
import { ContactsSlice, FoldersSlice } from '../../types/store';

export function extractFolders(accordions: ContactsFolder[]): ContactsFolder[] {
	return reduce(
		accordions,
		(acc, v) => {
			if (v && v.items && v.items.length) {
				return [...acc, v, ...extractFolders(v.items)];
			}
			return [...acc, v];
		},
		[] as ContactsFolder[]
	);
}

export function findDepth(subFolder: ContactsFolder, depth = 1): number {
	if (subFolder && subFolder.items && subFolder.items.length) {
		return <number>max(map(subFolder.items, (item) => findDepth(item, depth + 1)));
	}
	return depth;
}

export function calcFolderItems(
	folders: ContactsFolder[],
	subFolders: ContactsFolder,
	id: string | undefined
): ContactsFolder[] {
	return map(
		filter(folders, (item) => item.parent === id),
		(item) => ({
			...item,
			items: calcFolderItems(folders, subFolders, item.id),
			to: `/folder/${item.id}`
		})
	);
}

export function calcFolderAbsParentLevelAndPath(
	folders: ContactsFolder[],
	subFolder: ContactsFolder | undefined,
	path = subFolder && subFolder.label,
	level = 1
): any {
	if (!subFolder) return undefined;
	const nextFolder = find(folders, (item) => item.id === subFolder.parent);
	const nextPath = `${nextFolder ? nextFolder.label : ''}/${path}`;
	return (
		calcFolderAbsParentLevelAndPath(folders, nextFolder, nextPath, level + 1) || {
			absParent: level > 1 ? subFolder.id : subFolder.parent,
			level,
			path
		}
	);
}

export function updateFolderInStore(state: FoldersSlice, folders: ContactsFolder[]): void {
	if (folders && folders.length) {
		state.folders = map(state.folders, (folder) => {
			const toRet = find(folders, (c) => c.id === folder.id) || folder;
			const items = calcFolderItems(state.folders, toRet, toRet.id);
			const moreParams = calcFolderAbsParentLevelAndPath(state.folders, toRet);

			return {
				...toRet,
				items,
				depth: findDepth({ ...toRet, items }),
				absParent: moreParams.absParent,
				level: moreParams.level,
				path: moreParams.path,
				to: `/folder/${toRet.id}`
			};
		});
	}
}

export function addCnAndItemsCount(state: FoldersSlice, contacts: Contact[]): void {
	if (contacts) {
		map(contacts, (contact) => {
			const folderToUpdate = find(state.folders, (folder) => folder.id === contact.parent);
			if (folderToUpdate && contact.id) {
				if (folderToUpdate.cn[0] && folderToUpdate.cn[0].ids) {
					if (!find(split(folderToUpdate.cn[0].ids, ','), (id) => id === contact.id)) {
						folderToUpdate.cn[0].ids += `,${contact.id}`;
						folderToUpdate.itemsCount += 1;
					}
				} else {
					folderToUpdate.cn[0] = { ids: contact.id };
					folderToUpdate.itemsCount += 1;
				}
			}
		});
	}
}

export function removeFoldersFromStore(
	state: FoldersSlice,
	idsToDelete?: Array<string | undefined>
): void {
	state.folders = reduce(
		state.folders,
		(acc, v) => {
			const value = some(idsToDelete, (cid) => cid === v.id);
			return value ? [...acc] : [...acc, v];
		},
		[] as ContactsFolder[]
	);
}

export function addFoldersToStore(state: FoldersSlice, folders: ContactsFolder[]): void {
	if (folders && folders.length) {
		const isFolderAvailable = state.folders.find((item) => item.id === folders[0].id);
		if (isFolderAvailable === undefined) {
			state.folders = reduce(folders, (acc, v) => [...acc, v], state.folders);
		}
	}
}

export function removeIndexFolderFromStore(state: ContactsSlice, index: string): void {
	state.contacts = reduce(
		state.contacts,
		(acc, v, k) => (k === index ? acc : { ...acc, [k]: v }),
		{}
	);
}

export function updateContactsInStore(state: ContactsSlice, contactsArray: Contact[]): void {
	state.contacts = reduce(
		state.contacts,
		(acc, v, k) => ({
			...acc,
			[k]: reduce(
				v,
				(acc2, v2) =>
					reduce(
						contactsArray,
						(acc3, v3) => (v3.id === v2.id ? [...acc3, v3] : [...acc3, v2]),
						acc2
					),
				[] as Contact[]
			)
		}),
		{}
	);
}

export function findContactsInStore(state: ContactsSlice, ids: Array<string>): Array<Contact> {
	return reduce(
		ids,
		(acc, id) =>
			reduce(
				state.contacts,
				(acc2, v2) => {
					const contactInStore = find(v2, (item) => item.id === id);
					if (contactInStore) {
						return [...acc2, cloneDeep(contactInStore)];
					}
					return acc2;
				},
				acc
			),
		[] as any
	);
}

export function addContactID(state: ContactsSlice, id: string): void {
	reduce(
		state.contacts,
		(acc, v) => {
			const contact = find(v, (item) => !item.id);
			if (contact && !contact.id) {
				contact.id = id;
			}
			return acc;
		},
		{}
	);
}

export function removeContactsFromStore(
	state: ContactsSlice,
	idsToDelete?: Array<string | undefined>
): void {
	state.contacts = reduce(
		state.contacts,
		(acc, v, k) =>
			idsToDelete
				? {
						...acc,
						[k]: filter(v, (contact) => !some(idsToDelete, (id) => id === contact.id))
				  }
				: {
						...acc,
						[k]: filter(v, (contact) => (contact.id ? contact : false))
				  },
		{}
	);
}

export function addContactsToStore(
	state: ContactsSlice,
	contacts: Contact[],
	sharedFolderParent?: string
): void {
	reduce(
		contacts,
		(acc, v) => {
			if (!acc[sharedFolderParent ?? v.parent]) {
				// eslint-disable-next-line no-param-reassign
				acc[sharedFolderParent ?? v.parent] = [];
			}
			acc[sharedFolderParent ?? v.parent].push(v);
			return acc;
		},
		state.contacts
	);
}
