/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';

import { CONTACTS_APP_ID } from '../../../constants';
import { storeReducers } from '../../store/reducers/reducers';
import { State } from '../../types/store';

export const generateStore = (preloadedState?: Partial<State>): EnhancedStore<State> =>
	configureStore({
		devTools: {
			name: CONTACTS_APP_ID
		},
		reducer: storeReducers,
		preloadedState
	});
