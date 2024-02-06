/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { sortBy, toLower } from 'lodash';
import { create } from 'zustand';

import { DistributionList } from '../model/distribution-list';
import { MakeOptional } from '../types/utils';

export type StoredDistributionList = MakeOptional<DistributionList, 'id'>;
type State = {
	distributionLists?: Array<StoredDistributionList>;
};

type Actions = {
	setDistributionLists: (newItems: Array<StoredDistributionList>) => void;
	upsertDistributionList: (item: StoredDistributionList) => void;
	reset: () => void;
};

const initialState: State = {
	distributionLists: undefined
};

export const useDistributionListsStore = create<State & Actions>()((set, get) => ({
	...initialState,
	setDistributionLists: (newItems): void => {
		set({ distributionLists: newItems });
	},
	upsertDistributionList: (item): void => {
		const current = get().distributionLists ?? [];
		const idx = current.findIndex((dl) => dl.id === item.id || dl.email === item.email);
		// TODO use toSpliced once available
		const newDistributionLists = [...current];
		newDistributionLists.splice(idx, idx === -1 ? 0 : 1, {
			...newDistributionLists[idx],
			...item
		});
		// Keep array sorted by "name" (display name in fallback to email) ascending
		set({
			distributionLists: sortBy(newDistributionLists, (dl) => toLower(dl.displayName || dl.email))
		});
	},
	reset: (): void => {
		set(initialState);
	}
}));
