/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CONTACT_ACTION_OPERATION, contactAction, ContactActionResponse } from './contact-action';

export const trashContacts = (contactsIds: Array<string>): Promise<ContactActionResponse> =>
	contactAction({ operation: CONTACT_ACTION_OPERATION.trash, contactsIds });
