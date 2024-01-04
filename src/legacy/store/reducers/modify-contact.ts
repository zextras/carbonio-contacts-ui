/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactsSlice, ModifyContactAction } from '../../types/store';
import { updateContactsInStore } from '../../utils/helpers';

export function modifyContactPending(state: ContactsSlice, { meta }: ModifyContactAction): void {
	const { updatedContact } = meta.arg;
	if (updatedContact) {
		updateContactsInStore(state, [updatedContact]);
	}
	state.status.pendingActions = true;
}

export function modifyContactFulFilled(state: ContactsSlice): void {
	state.status.pendingActions = false;
}

export function modifyContactRejected(state: ContactsSlice, { meta }: ModifyContactAction): void {
	const { editContact } = meta.arg;
	if (editContact) {
		updateContactsInStore(state, [editContact]);
	}
	state.status.pendingActions = false;
}
