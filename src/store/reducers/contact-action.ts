/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter, find, indexOf, map, some, split } from 'lodash';
import { ContactsSlice } from '../../types/store';
import { addContactsToStore, findContactsInStore, removeContactsFromStore } from '../utils/helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function contactActionPending(state: any, request: any): void {
	const { op, contactsIDs, originID, destinationID } = request.meta.arg;

	if (state.contacts) {
		state.status.pendingActions = true;

		const contacts = map(findContactsInStore(state, contactsIDs), (contact) => ({
			...contact,
			parent: destinationID
		}));
		// eslint-disable-next-line no-param-reassign
		request.meta.arg.prevState = cloneDeep(state.contacts);
		switch (op) {
			case 'move':
				if (contactsIDs) {
					removeContactsFromStore(state, contactsIDs);
				}
				if (contacts) {
					addContactsToStore(state, contacts);
				}
				break;
			case 'delete':
				if (contactsIDs) {
					removeContactsFromStore(state, contactsIDs);
				}
				break;
			default:
				break;
		}
	}
	if (state.folders) {
		// eslint-disable-next-line no-param-reassign
		request.meta.arg.prevState = cloneDeep(state.folders);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const originFolder = find(state.folders, (item) => item.id === originID)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const destinationFolder = find(state.folders, (item) => item.id === destinationID)!;
		const originFolderIDsArray =
			indexOf(originFolder?.cn[0]?.ids, ',') === -1
				? [originFolder.cn[0].ids]
				: split(originFolder.cn[0].ids, ',');

		const contactsIDsArrayToUpdate =
			indexOf(contactsIDs, ',') === -1 ? contactsIDs : split(contactsIDs, ',');

		switch (op) {
			case 'move':
				// update previous folder
				originFolder.itemsCount -= contactsIDsArrayToUpdate.length;
				originFolder.cn[0].ids = filter(
					originFolderIDsArray,
					(id) => !some(contactsIDsArrayToUpdate, (cid) => cid === id)
				).join(',');
				// update new folder
				destinationFolder.itemsCount += contactsIDsArrayToUpdate.length;
				if (destinationFolder.cn[0] && destinationFolder.cn[0].ids) {
					destinationFolder.cn[0].ids += `,${contactsIDs.join(',')}`;
				} else {
					destinationFolder.cn[0] = { ids: contactsIDs.join(',') };
				}
				break;
			case 'delete':
				originFolder.itemsCount -= 1;
				originFolder.cn[0].ids = filter(split(originFolder.cn[0].ids, ','), (id) =>
					some(contactsIDsArrayToUpdate, (cid) => cid === id)
				).join(',');
				break;
			default:
				console.warn('operation not handled!', op);
				break;
		}
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function contactActionFulFilled(state: any): void {
	if (state.contacts) state.status.pendingActions = false;
	if (state.folders) state.status = 'idle';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function contactActionRejected(state: any, { meta }: any): void {
	if (state.contacts) {
		state.contacts = meta.arg.prevState;
		state.status.pendingActions = false;
	}

	if (state.folders) state.folders = meta.arg.prevState;
}
