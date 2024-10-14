/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SEARCHED_FOLDER_STATE_STATUS } from '../../../constants';
import { ContactsSlice, State } from '../../types/store';
import { addContactsToStore } from '../../utils/helpers';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

export function searchContactsPending(state: ContactsSlice): void {
	state.status.pendingActions = true;
}

export function searchContactsRejected(state: ContactsSlice): void {
	state.status.pendingActions = false;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function searchContactsFullFilled(state: State['contacts'], { meta, payload }: any): void {
	const contacts = normalizeContactsFromSoap(payload);
	if (state.contacts) {
		if (payload && contacts) {
			addContactsToStore(state, contacts, meta.arg);
		} else {
			state.contacts[meta.arg] = [];
		}
		state.searchedInFolder = {
			...state.searchedInFolder,
			[meta.arg.folderId]: payload.hasMore
				? SEARCHED_FOLDER_STATE_STATUS.hasMore
				: SEARCHED_FOLDER_STATE_STATUS.complete
		};
		state.status.pendingActions = false;
		state.status[meta.arg] = true;
	}
}
