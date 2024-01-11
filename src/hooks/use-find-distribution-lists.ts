/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';

export const useFindDistributionLists = ({
	ownerOf,
	memberOf
}: {
	ownerOf: boolean;
	memberOf: boolean;
}): Array<DistributionList> => {
	const [items, setItems] = useState<Array<DistributionList>>([]);

	useEffect(() => {
		client.getAccountDistributionLists({ ownerOf, memberOf }).then((newItems) => {
			setItems(newItems);
		});
	}, [memberOf, ownerOf]);

	return items;
};
