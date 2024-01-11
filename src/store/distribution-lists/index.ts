/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

import { DistributionList } from '../../model/distribution-list';

export type DistributionListsState = {
	storedDistributionLists: Array<DistributionList> | undefined;
	setStoredDistributionLists: (newDistributionLists: Array<DistributionList>) => void;
	addStoredDistributionLists: (newDistributionLists: Array<DistributionList>) => void;
};

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useDistributionListsStore = create<DistributionListsState>()((set, get) => ({
	storedDistributionLists: undefined,
	setStoredDistributionLists: (distributionLists: Array<DistributionList>): void =>
		set(() => ({
			storedDistributionLists: distributionLists
		})),
	addStoredDistributionLists: (distributionLists: Array<DistributionList>): void =>
		set(() => ({
			storedDistributionLists: [...(get().storedDistributionLists ?? []), ...distributionLists]
		}))
}));
