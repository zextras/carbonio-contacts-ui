/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactsSlice, ModifyContactGroup } from '../../types/store';
import { updateContactsInStore } from '../../utils/helpers';

export function modifyContactGroupPending(state: ContactsSlice): void {
	state.status.pendingActions = true;
}

export function modifyContactGroupFulFilled(
	state: ContactsSlice,
	{ payload }: ModifyContactGroup
): void {
	if (payload) {
		updateContactsInStore(state, [payload]);
	}
	state.status.pendingActions = false;
}

export function modifyContactGroupRejected(state: ContactsSlice): void {
	state.status.pendingActions = false;
}
