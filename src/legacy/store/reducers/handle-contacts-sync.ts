/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, forEach, map, orderBy, reduce, reject, uniqBy } from 'lodash';

import { Contact, ContactOrGroup } from '../../types/contact';
import { ContactsSlice } from '../../types/store';
import { isGroup, removeContactsFromStore } from '../../utils/helpers';

export function handleCreatedContactsSyncReducer(
	state: ContactsSlice,
	{ payload }: { payload: Array<Contact> }
): void {
	forEach(payload, (cn) => {
		if (cn.id && cn.parent) {
			state.contacts[cn.parent] = orderBy(
				[
					...map(
						reject(
							state.contacts[cn.parent],
							(item) => (item.id === cn.id || !item.id) && !isGroup(item)
						) as Contact[],
						(cnt) => ({
							...cnt,
							fileAsStr: cnt.fileAsStr.toLowerCase()
						})
					),
					cn
				],
				'fileAsStr'
			);
		}
	});
}

export function handleModifiedContactsSyncReducer(
	state: ContactsSlice,
	{ payload }: { payload: Array<Contact> }
): void {
	forEach(payload, (cn) => {
		if (cn.id) {
			state.contacts = reduce(
				state.contacts,
				(acc, v, key) => {
					const oldContact = find(v, ['id', cn.id]) as Contact;
					if (oldContact) {
						const updated = { ...oldContact, ...cn };
						return oldContact.parent !== updated.parent
							? {
									...acc,
									[key]: reject(v, ['id', updated.id]),
									[updated.parent]: [...(state.contacts?.[updated.parent] ?? []), updated]
								}
							: {
									...acc,
									[updated.parent]: map(state.contacts[updated.parent], (item) =>
										item.id === updated.id ? updated : item
									)
								};
					}

					return { ...acc, [key]: uniqBy([...(acc[key] ?? []), ...v], 'id') };
				},
				{} as { [k: string]: Array<ContactOrGroup> }
			);
		}
	});
}

export function handleDeletedContactsSyncReducer(
	state: ContactsSlice,
	{ payload }: { payload: Array<string> }
): void {
	removeContactsFromStore(state, payload);
}

export function handleResetContactFolderSyncReducer(
	state: ContactsSlice,
	{ payload }: { payload: string }
): void {
	const folderId = payload;
	state.contacts[folderId] = [];
	delete state.searchedInFolder[folderId];
	state.status.pendingActions = false;
	delete state.status[folderId];
}
