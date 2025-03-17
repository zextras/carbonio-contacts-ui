/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';

import { INITIAL_STATE } from './constants';
import { SEARCHED_FOLDER_STATE_STATUS } from '../../../constants';
import { State } from '../../types/store';
import { folderAction } from '../actions/folder-action';
import { folderActionPending, folderActionRejected } from '../reducers/folder-action';
import {
	handleDeletedContactsSyncReducer,
	handleCreatedContactsSyncReducer,
	handleModifiedContactsSyncReducer,
	handleResetContactsSyncReducer
} from '../reducers/handle-contacts-sync';

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: INITIAL_STATE,
	reducers: {
		handleModifiedContactsSync: handleModifiedContactsSyncReducer,
		handleCreatedContactsSync: handleCreatedContactsSyncReducer,
		handleDeletedContactsSync: handleDeletedContactsSyncReducer,
		handleResetContactsSync: handleResetContactsSyncReducer
	},
	extraReducers: (builder) => {
		builder.addCase(folderAction.pending, folderActionPending);
		builder.addCase(folderAction.rejected, folderActionRejected);
	}
});

export const {
	handleCreatedContactsSync,
	handleModifiedContactsSync,
	handleDeletedContactsSync,
	handleResetContactsSync
} = contactsSlice.actions;
export const contactSliceReducer = contactsSlice.reducer;

export const selectFolderHasMore = (state: State, id: string): boolean =>
	state.contacts.searchedInFolder?.[id] === SEARCHED_FOLDER_STATE_STATUS.hasMore;
