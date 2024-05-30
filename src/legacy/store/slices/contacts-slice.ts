/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';

import { State } from '../../types/store';
import { contactAction } from '../actions/contact-action';
import { createContact } from '../actions/create-contact';
import { folderAction } from '../actions/folder-action';
import { modifyContact } from '../actions/modify-contact';
import { searchContacts } from '../actions/search-contacts';
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
	handleDeletedContactsSyncReducer,
	handleCreatedContactsSyncReducer,
	handleModifiedContactsSyncReducer
} from '../reducers/handle-contacts-sync';
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

const initialState: State['contacts'] = {
	status: {
		pendingActions: false
	},
	contacts: {}
};

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState,
	reducers: {
		handleModifiedContactsSync: handleModifiedContactsSyncReducer,
		handleCreatedContactsSync: handleCreatedContactsSyncReducer,
		handleDeletedContactsSync: handleDeletedContactsSyncReducer
	},
	extraReducers: (builder) => {
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

export const { handleCreatedContactsSync, handleModifiedContactsSync, handleDeletedContactsSync } =
	contactsSlice.actions;
export const contactSliceReducer = contactsSlice.reducer;
