/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { useDistributionListsStore } from '../store/distribution-lists';

export const useFindDistributionLists = ({
	ownerOf,
	memberOf
}: {
	ownerOf: boolean;
	memberOf: boolean;
}): Array<DistributionList> => {
	const { storedDistributionLists, setStoredDistributionLists } = useDistributionListsStore();

	useEffect(() => {
		if (storedDistributionLists === undefined) {
			client.getAccountDistributionLists({ ownerOf, memberOf }).then((newItems) => {
				setStoredDistributionLists(newItems);
			});
		}
	}, [setStoredDistributionLists, memberOf, ownerOf, storedDistributionLists]);

	return storedDistributionLists ?? [];
};
