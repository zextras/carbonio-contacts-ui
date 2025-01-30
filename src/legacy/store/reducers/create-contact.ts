/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	AddContactAction,
	AddContactGroup,
	AddContactRequest,
	ContactsSlice
} from '../../types/store';
import {
	removeContactsWithoutID,
	addContactsToStore,
	removeContactsFromStore
} from '../../utils/helpers';

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
			removeContactsWithoutID(state);
		}
		state.status.pendingActions = false;
	}
}

export function createContactRejected(state: ContactsSlice): void {
	removeContactsFromStore(state);
	state.status.pendingActions = false;
}

export function createContactGroupFulFilled(
	state: ContactsSlice,
	{ payload }: AddContactGroup
): void {
	if (payload) {
		addContactsToStore(state, [payload]);
	}
}
export function createContactGroupPending(state: ContactsSlice): void {
	state.status.pendingActions = true;
}
export function createContactGroupRejected(state: ContactsSlice): void {
	removeContactsFromStore(state);
	state.status.pendingActions = false;
}
