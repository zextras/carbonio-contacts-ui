/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode } from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { CONTACTS_APP_ID } from '../../../constants';
import { storeReducers } from '../reducers/reducers';

export default combineReducers({});

export const store = configureStore({
	devTools: {
		name: CONTACTS_APP_ID
	},
	reducer: storeReducers
});

export const StoreProvider = ({ children }: { children: ReactNode }): React.JSX.Element => (
	<Provider store={store}>{children}</Provider>
);

// @see https://redux.js.org/usage/usage-with-typescript#define-root-state-and-dispatch-types
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
