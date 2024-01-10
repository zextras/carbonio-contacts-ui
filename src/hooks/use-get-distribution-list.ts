/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { RequireAtLeastOne } from '../types/utils';

export const useGetDistributionList = (
	item: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>>
): DistributionList | undefined => {
	const [distributionList, setDistributionList] = useState<DistributionList | undefined>();

	useEffect(() => {
		client.getDistributionList(item).then((dl) => {
			setDistributionList(dl);
		});
	}, [item]);

	return distributionList;
};
