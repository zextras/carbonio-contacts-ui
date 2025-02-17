/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AddContactGroup, ContactsSlice } from '../../types/store';
import { addContactsToStore, removeContactsFromStore } from '../../utils/helpers';

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
