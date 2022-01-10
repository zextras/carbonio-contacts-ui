/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import { createContact } from '../actions/create-contact';
import { contactAction } from '../actions/contact-action';
import { folderAction } from '../actions/folder-action';
import { getContacts } from '../actions/get-contacts';
import { searchContacts } from '../actions/search-contacts';
import { modifyContact } from '../actions/modify-contact';
import {
	contactActionFulFilled,
	contactActionPending,
	contactActionRejected
} from '../reducers/contact-action';
import {
	createContactFulFilled,
	createContactPending,
	createContactRejected
} from '../reducers/create-contact';
import { folderActionPending, folderActionRejected } from '../reducers/folder-action';
import {
	getContactsFullFilled,
	getContactsPending,
	getContactsRejected
} from '../reducers/get-contacts';
import { handleContactSyncReducer } from '../reducers/handle-sync';
import {
	modifyContactFulFilled,
	modifyContactPending,
	modifyContactRejected
} from '../reducers/modify-contact';
import {
	searchContactsFullFilled,
	searchContactsPending,
	searchContactsRejected
} from '../reducers/search-contacts';

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: {
		status: {
			pendingActions: false
		},
		contacts: {}
	},
	reducers: {
		handleContactsSync: handleContactSyncReducer
	},
	extraReducers: (builder) => {
		builder.addCase(getContacts.pending, getContactsPending);
		builder.addCase(getContacts.fulfilled, getContactsFullFilled);
		builder.addCase(getContacts.rejected, getContactsRejected);
		builder.addCase(searchContacts.pending, searchContactsPending);
		builder.addCase(searchContacts.fulfilled, searchContactsFullFilled);
		builder.addCase(searchContacts.rejected, searchContactsRejected);
		builder.addCase(createContact.pending, createContactPending);
		builder.addCase(createContact.fulfilled, createContactFulFilled);
		builder.addCase(createContact.rejected, createContactRejected);
		builder.addCase(modifyContact.pending, modifyContactPending);
		builder.addCase(modifyContact.fulfilled, modifyContactFulFilled);
		builder.addCase(modifyContact.rejected, modifyContactRejected);
		builder.addCase(contactAction.pending, contactActionPending);
		builder.addCase(contactAction.fulfilled, contactActionFulFilled);
		builder.addCase(contactAction.rejected, contactActionRejected);
		builder.addCase(folderAction.pending, folderActionPending);
		builder.addCase(folderAction.rejected, folderActionRejected);
	}
});

export const { handleContactsSync } = contactsSlice.actions;
export const contactSliceReducer = contactsSlice.reducer;
