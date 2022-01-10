/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AddContactAction, AddContactRequest, ContactsSlice } from '../../types/store';
import { normalizeContactsFromSoap } from '../normalizations/normalize-contact-from-soap';
import {
	addCnAndItemsCount,
	addContactID,
	addContactsToStore,
	removeContactsFromStore
} from '../utils/helpers';

export function createContactPending(state: ContactsSlice, { meta }: AddContactRequest): void {
	if (meta && meta.arg) {
		addContactsToStore(state, [meta.arg]);
	}
	state.status.pendingActions = true;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createContactFulFilled(state: any, { payload }: AddContactAction): void {
	if (state.contacts) {
		if (payload) {
			addContactID(state, payload[0].id);
		}
		state.status.pendingActions = false;
	}
	if (state.folders) {
		const normalizedCn = normalizeContactsFromSoap(payload);
		if (normalizedCn) {
			addCnAndItemsCount(state, normalizedCn);
		}
	}
}

export function createContactRejected(state: ContactsSlice): void {
	removeContactsFromStore(state);
	state.status.pendingActions = false;
}
