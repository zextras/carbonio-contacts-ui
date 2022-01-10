/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers } from '@reduxjs/toolkit';
import { folderSliceReducer } from '../slices/folders-slice';
import { contactSliceReducer } from '../slices/contacts-slice';

export default combineReducers({
	folders: folderSliceReducer,
	contacts: contactSliceReducer
});
