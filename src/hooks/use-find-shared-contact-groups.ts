/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect } from 'react';

import { SharedContactGroup } from '../model/contact-group';
import { findSharedContactGroups } from '../network/api/find-contact-groups';
import { useContactGroupStore } from '../store/contact-groups';

type UseFindSharedContactGroupsReturnType = {
	sharedContactGroups: Array<SharedContactGroup>;
};

export const useFindSharedContactGroups = (
	accountId: string
): UseFindSharedContactGroupsReturnType => {
	const findCallback = useCallback(() => {
		if (!accountId) return;
		findSharedContactGroups(accountId, 0).then((result) => {
			const sharedContactGroups = result.contactGroups.map((cg) => ({ ...cg, accountId }));
			useContactGroupStore
				.getState()
				.populateSharedContactGroupsByAccountId(accountId, sharedContactGroups);
		});
	}, [accountId]);

	useEffect(() => {
		findCallback();
	}, [findCallback]);

	const sharedContactGroups = useContactGroupStore
		.getState()
		.getSharedContactGroupsByAccountId(accountId);

	if (!accountId) return { sharedContactGroups: [] };
	return { sharedContactGroups };
};
