/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { removeContactsFromStore, updateContactsParent } from '../contacts';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleContactAction({
	op,
	contactsIDs,
	destinationId
}: {
	op: string;
	contactsIDs: Array<string>;
	destinationId?: string;
}): void {
	switch (op) {
		case 'move':
			if (contactsIDs) {
				removeContactsFromStore(contactsIDs);
			}
			if (contactsIDs.length > 0 && destinationId) {
				const contactsWithNewParent = contactsIDs.map((contactID) => ({
					id: contactID,
					newParent: destinationId
				}));
				updateContactsParent(contactsWithNewParent);
			}
			break;
		case 'delete':
			if (contactsIDs) {
				removeContactsFromStore(contactsIDs);
			}
			break;
		default:
			break;
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
