/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { client } from '../network/client';

type UseGetDistributionListMembersReturnType = {
	members: Array<string>;
	hasMore: boolean;
	findMore: () => void;
	totalMembers: number;
};

export const useGetDistributionListMembers = (
	email: string,
	limit?: number
): UseGetDistributionListMembersReturnType => {
	const [distributionListMembers, setDistributionListMembers] = useState<Array<string>>([]);
	const offsetRef = useRef<number>(0);
	const [hasMore, setHasMore] = useState(false);
	const [totalMembers, setTotalMembers] = useState(0);

	const findCallback = useCallback(
		(offset: number) => {
			if (email) {
				client
					.getDistributionListMembers(email, { offset, limit })
					.then(({ total, members, more }) => {
						setDistributionListMembers((prevState) =>
							offset === 0 ? members : [...prevState, ...members]
						);
						offsetRef.current += members.length;
						setHasMore(more);
						setTotalMembers(total);
					});
			}
		},
		[email, limit]
	);

	useEffect(() => {
		findCallback(0);
	}, [findCallback]);

	const findMore = useCallback(() => {
		if (!hasMore) {
			throw new Error('No more members available');
		}
		findCallback(offsetRef.current);
	}, [findCallback, hasMore]);

	return { members: distributionListMembers, hasMore, findMore, totalMembers };
};
