/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect } from 'react';

import { SharedContactGroup } from '../model/contact-group';
import { findContactGroups } from '../network/api/find-contact-groups';
import { useContactGroupStore } from '../store/contact-groups';

type UseFindSharedContactGroupsReturnType = {
	sharedContactGroups: Array<SharedContactGroup>;
};

export const useFindSharedContactGroups = (
	accountId: string
): UseFindSharedContactGroupsReturnType => {
	const findCallback = useCallback(() => {
		if (!accountId) return;
		findContactGroups(0, accountId).then((result) => {
			useContactGroupStore
				.getState()
				.populateSharedContactGroupsByAccountId(accountId, result.contactGroups);
		});
	}, [accountId]);

	useEffect(() => {
		findCallback();
	}, [findCallback]);

	const sharedContactGroups = useContactGroupStore((state) =>
		state.getSharedContactGroupsByAccountId(accountId)
	);

	if (!accountId) return { sharedContactGroups: [] };
	return { sharedContactGroups };
};
