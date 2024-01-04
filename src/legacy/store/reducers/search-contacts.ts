/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';
import { ContactsSlice } from '../../types/store';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';
import { addContactsToStore, removeContactsFromStore } from '../../utils/helpers';

export function searchContactsPending(state: ContactsSlice): void {
	state.status.pendingActions = true;
}

export function searchContactsRejected(state: ContactsSlice): void {
	state.status.pendingActions = false;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function searchContactsFullFilled(state: any, { meta, payload }: any): void {
	const contacts = normalizeContactsFromSoap(payload);
	if (state.contacts) {
		if (payload) {
			removeContactsFromStore(
				state,
				map(contacts, (item) => item.id)
			);
			if (contacts) {
				addContactsToStore(state, contacts, meta.arg);
			}
		} else {
			state.contacts[meta.arg] = [];
		}
		state.status.pendingActions = false;
		state.status[meta.arg] = true;
	}
}
