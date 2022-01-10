/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach, findIndex } from 'lodash';
import { FoldersSlice } from '../../types/store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getFolderFulFilled(state: FoldersSlice, { meta, payload }: any): void {
	forEach(payload?.folder?.[0]?.link, (f) => {
		const contactIndex = findIndex(state.folders, { id: f.id });
		if (contactIndex >= 0) {
			state.folders[contactIndex].perm = f.perm;
		}
	});
	state.status = 'fulfilled';
}
