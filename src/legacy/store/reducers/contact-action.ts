/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, map } from 'lodash';

import {
	addContactsToStore,
	findContactsInStore,
	removeContactsFromStore
} from '../../utils/helpers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function contactActionPending(state: any, request: any): void {
	const { op, contactsIDs, destinationID } = request.meta.arg;

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
