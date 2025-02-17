import { State } from '../../types/store';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const INITIAL_STATE: State['contacts'] = {
	status: {
		pendingActions: false
	},
	contacts: {},
	searchedInFolder: {}
};
