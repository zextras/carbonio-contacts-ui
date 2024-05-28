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
import { RootState } from '../redux';

export const moveContactsPending = (state: RootState['contacts'], request: any): void => {
	const { contactsIds, destinationId } = request.meta.arg;

	if (state.contacts) {
		const contacts = map(findContactsInStore(state, contactsIds), (contact) => ({
			...contact,
			parent: destinationId
		}));
		request.meta.arg.prevState = cloneDeep(state.contacts);

		if (contactsIds) {
			removeContactsFromStore(state, contactsIds);
		}
		if (contacts) {
			addContactsToStore(state, contacts);
		}
	}
};

export const moveContactsRejected = (state: RootState['contacts'], request: any): void => {
	if (state.contacts) {
		state.contacts = request.meta.arg.prevState;
	}
};
