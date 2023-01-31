/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { CONTACTS_APP_ID } from '../../constants';
import { storeReducers } from '../reducers/reducers';

export default combineReducers({});

export const store = configureStore({
	devTools: {
		name: CONTACTS_APP_ID
	},
	reducer: storeReducers
});

export const StoreProvider: FC = ({ children }) => <Provider store={store}>{children}</Provider>;
