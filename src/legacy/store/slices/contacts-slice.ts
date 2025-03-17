/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';

import { INITIAL_STATE } from './constants';
import { folderAction } from '../actions/folder-action';
import { folderActionPending, folderActionRejected } from '../reducers/folder-action';

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: INITIAL_STATE,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(folderAction.pending, folderActionPending);
		builder.addCase(folderAction.rejected, folderActionRejected);
	}
});

export const contactSliceReducer = contactsSlice.reducer;
