/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { sortBy } from 'lodash';
import { create } from 'zustand';

import { DistributionList } from '../model/distribution-list';

type State = {
	distributionLists: Array<DistributionList>;
};

type Actions = {
	setDistributionLists: (newItems: Array<DistributionList>) => void;
	upsertDistributionList: (item: DistributionList) => void;
	reset: () => void;
};

export const useDistributionListsStore = create<State & Actions>()((set, get) => ({
	distributionLists: [],
	setDistributionLists: (newItems: Array<DistributionList>): void => {
		set({ distributionLists: newItems });
	},
	upsertDistributionList: (item: DistributionList): void => {
		const idx = get().distributionLists.findIndex((dl) => dl.id === item.id);
		// TODO use toSpliced once available
		const newDistributionLists = [...get().distributionLists];
		newDistributionLists.splice(idx, idx === -1 ? 0 : 1, item);
		// Keep array sorted by "name" (display name in fallback to email) ascending
		set({ distributionLists: sortBy(newDistributionLists, (dl) => dl.displayName || dl.email) });
	},
	reset: (): void => {
		set({ distributionLists: [] });
	}
}));
