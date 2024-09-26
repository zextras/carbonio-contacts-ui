/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect } from 'react';

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { SharedContactGroup } from '../model/contact-group';
import { findContactGroups } from '../network/api/find-contact-groups';
import { useContactGroupStore, useSharedAccountData } from '../store/contact-groups';

type UseFindSharedContactGroupsReturnType = {
	sharedContactGroups: Array<SharedContactGroup>;
	findMore: () => void;
	hasMore: boolean;
};

export const useFindSharedContactGroups = (
	accountId: string
): UseFindSharedContactGroupsReturnType => {
	const sharedAccountData = useSharedAccountData(accountId);
	const hasMore = sharedAccountData?.hasMore ?? false;
	const sharedContactGroups = useContactGroupStore
		.getState()
		.getSharedContactGroupsByAccountId(accountId);

	const findCallback = useCallback(() => {
		if (!accountId) return;
		const offset = sharedAccountData?.offset ?? 0;
		findContactGroups(offset, accountId).then((result) => {
			useContactGroupStore
				.getState()
				.populateSharedContactGroupsByAccountId(
					accountId,
					result.contactGroups,
					offset + FIND_CONTACT_GROUP_LIMIT,
					result.hasMore
				);
		});
	}, [accountId, sharedAccountData?.offset]);

	const hasData = !!sharedAccountData;

	useEffect(() => {
		if (hasData) {
			return;
		}
		findCallback();
	}, [findCallback, hasData]);

	const findMore = useCallback(() => {
		if (!hasMore) {
			throw new Error('No more nodes available');
		}
		findCallback();
	}, [findCallback, hasMore]);

	if (!accountId) return { sharedContactGroups: [], findMore, hasMore: false };
	return { sharedContactGroups, findMore, hasMore };
};
