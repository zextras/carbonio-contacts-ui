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
};

export const useFindSharedContactGroups = (
	accountId: string
): UseFindSharedContactGroupsReturnType => {
	const sharedAccountData = useSharedAccountData(accountId);
	const hasMore = sharedAccountData?.hasMore ?? false;

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

	const hasData = Object.keys(sharedAccountData?.contactGroups ?? {}).length > 0;

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

	const sharedContactGroups = useContactGroupStore((state) =>
		state.getSharedContactGroupsByAccountId(accountId)
	);

	if (!accountId) return { sharedContactGroups: [], findMore };
	return { sharedContactGroups, findMore };
};
