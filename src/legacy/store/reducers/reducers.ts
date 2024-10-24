/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers } from '@reduxjs/toolkit';

import { contactSliceReducer } from '../slices/contacts-slice';

export const storeReducers = combineReducers({
	contacts: contactSliceReducer
});
