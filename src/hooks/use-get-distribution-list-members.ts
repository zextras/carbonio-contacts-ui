/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { useContactGroupStore } from '../store/contact-groups';
import { RequireAtLeastOne } from '../types/utils';

type UseGetDistributionListMembersReturnType = {
	members: Array<string>;
	hasMore: boolean;
	findMore: () => void;
	totalMembers: number;
};

export const useGetDistributionListMembers = (
	item: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>>,
	limit?: number
): UseGetDistributionListMembersReturnType => {
	const [distributionListMembers, setDistributionListMembers] = useState<Array<string>>([]);
	const offsetRef = useRef<number>(0);
	const [hasMore, setHasMore] = useState(false);
	const [totalMembers, setTotalMembers] = useState(0);

	const findCallback = useCallback(() => {
		client
			.getDistributionListMembers(item, { offset: offsetRef.current, limit })
			.then(({ total, members, more }) => {
				setDistributionListMembers((oldNodes) => [...oldNodes, ...members]);
				offsetRef.current += FIND_CONTACT_GROUP_LIMIT;
				setHasMore(more);
				setTotalMembers(total);
			});
	}, [item, limit]);

	useEffect(() => {
		if (useContactGroupStore.getState().storedContactGroups.length > 0) {
			return;
		}
		findCallback();
	}, [findCallback]);

	const findMore = useCallback(() => {
		if (!hasMore) {
			throw new Error('No more nodes available');
		}
		findCallback();
	}, [findCallback, hasMore]);

	return { members: distributionListMembers, hasMore, findMore, totalMembers };
};
