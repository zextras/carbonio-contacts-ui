/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useState } from 'react';

import { SharedContactGroup } from '../model/contact-group';
import { findContactGroups } from '../network/api/find-contact-groups';
import {
	getSharedContactGroupHasMore,
	getSharedContactGroupOffset,
	useContactGroupStore
} from '../store/contact-groups';

type UseFindSharedContactGroupsReturnType = {
	sharedContactGroups: Array<SharedContactGroup>;
	hasMore: boolean;
	findMore: () => void;
};

export const useFindSharedContactGroups = (
	accountId: string
): UseFindSharedContactGroupsReturnType => {
	const [hasMore, setHasMore] = useState({
		accountId,
		hasMore: getSharedContactGroupHasMore(accountId)
	});
	const findCallback = useCallback(() => {
		if (!accountId) return;
		const offset = getSharedContactGroupHasMore(accountId)
			? getSharedContactGroupOffset(accountId)
			: 0;
		findContactGroups(offset, accountId).then((result) => {
			useContactGroupStore
				.getState()
				.populateSharedContactGroupsByAccountId(accountId, result.contactGroups);
		});
	}, [accountId]);

	useEffect(() => {
		if (useContactGroupStore.getState().orderedContactGroups.length > 0) {
			return;
		}
		findCallback();
	}, [findCallback]);

	const findMore = useCallback(() => {
		if (!hasMore.hasMore) {
			throw new Error('No more nodes available');
		}
		findCallback();
	}, [findCallback, hasMore.hasMore]);

	const sharedContactGroups = useContactGroupStore((state) =>
		state.getSharedContactGroupsByAccountId(accountId)
	);

	if (!accountId) return { sharedContactGroups: [] };
	return { sharedContactGroups, hasMore, findMore };
};
