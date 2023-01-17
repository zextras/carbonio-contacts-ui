/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/no-extraneous-dependencies */

import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { CONTACTS_APP_ID } from '../../constants';
import { storeReducers } from '../../store/reducers/reducers';

type StateType = {
	folders: {
		status: string;
		folders: never[];
	};
	contacts: {
		status: {
			pendingActions: boolean;
		};
		// eslint-disable-next-line @typescript-eslint/ban-types
		contacts: {};
	};
};

export const generateStore = (): EnhancedStore<StateType> => {
	const store = configureStore({
		devTools: {
			name: CONTACTS_APP_ID
		},
		reducer: storeReducers
	});
	return store;
};
