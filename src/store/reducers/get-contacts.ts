/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';
import { ContactsSlice, GetContactAction } from '../../types/store';
import { normalizeContactsFromSoap } from '../normalizations/normalize-contact-from-soap';
import { addCnAndItemsCount, addContactsToStore, removeContactsFromStore } from '../utils/helpers';

export function getContactsPending(state: ContactsSlice): void {
	state.status.pendingActions = true;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getContactsFullFilled(state: any, { payload }: GetContactAction): void {
	const contacts = normalizeContactsFromSoap(payload);

	if (state.contacts) {
		if (payload) {
			removeContactsFromStore(
				state,
				map(contacts, (item) => item.id)
			);
			if (contacts) {
				addContactsToStore(state, contacts);
			}
		}
		state.status.pendingActions = false;
	}
	if (state.folders) {
		if (contacts) {
			addCnAndItemsCount(state, contacts);
		}
	}
}

export function getContactsRejected(state: ContactsSlice): void {
	state.status.pendingActions = false;
}
