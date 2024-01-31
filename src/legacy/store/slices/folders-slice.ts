/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';

import { State } from '../../types/store';
import { contactAction } from '../actions/contact-action';
import { createContact } from '../actions/create-contact';
import { createFolder } from '../actions/create-folder';
import { folderAction } from '../actions/folder-action';
import { getFolder } from '../actions/get-folder';
import { searchContacts } from '../actions/search-contacts';
import {
	contactActionFulFilled,
	contactActionPending,
	contactActionRejected
} from '../reducers/contact-action';
import { createContactFulFilled } from '../reducers/create-contact';
import {
	createFolderFulFilled,
	createFolderPending,
	createFolderRejected
} from '../reducers/create-folder';
import {
	folderActionFulFilled,
	folderActionPending,
	folderActionRejected
} from '../reducers/folder-action';
import { getFolderFulFilled } from '../reducers/get-folder';
import { handleFolderSyncReducer, handleRefreshReducer } from '../reducers/handle-folder-sync';
import { searchContactsFullFilled } from '../reducers/search-contacts';

const initialState: State['folders'] = {
	status: 'idle',
	folders: []
};

export const foldersSlice = createSlice({
	name: 'folders',
	initialState,
	reducers: {
		handleFoldersSync: handleFolderSyncReducer,
		handleRefresh: handleRefreshReducer
	},
	extraReducers: (builder) => {
		builder.addCase(folderAction.pending, folderActionPending);
		builder.addCase(folderAction.fulfilled, folderActionFulFilled);
		builder.addCase(folderAction.rejected, folderActionRejected);
		builder.addCase(createFolder.pending, createFolderPending);
		builder.addCase(createFolder.fulfilled, createFolderFulFilled);
		builder.addCase(createFolder.rejected, createFolderRejected);
		builder.addCase(getFolder.fulfilled, getFolderFulFilled);
		builder.addCase(createContact.fulfilled, createContactFulFilled);
		builder.addCase(contactAction.pending, contactActionPending);
		builder.addCase(contactAction.fulfilled, contactActionFulFilled);
		builder.addCase(contactAction.rejected, contactActionRejected);
		builder.addCase(searchContacts.fulfilled, searchContactsFullFilled);
	}
});
export const { handleFoldersSync, handleRefresh } = foldersSlice.actions;
export const folderSliceReducer = foldersSlice.reducer;
