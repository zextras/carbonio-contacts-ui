/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { ContactGroup } from '../model/contact-group';
import { apiClient } from '../network/api-client';
import { useContactGroupStore } from '../store/contact-groups';

type UseFindContactGroupsReturnType = {
	contactGroups: Array<ContactGroup>;
	hasMore: boolean;
	findMore: () => void;
};

export const useFindContactGroups = (folderId: string): UseFindContactGroupsReturnType => {
	const isFirstRender = useRef(true);
	const { addContactGroups, setOffset, getContactGroupsByFolderId } = useContactGroupStore();
	const contactGroupsByFolder = getContactGroupsByFolderId(folderId);

	const [hasMore, setHasMore] = useState(useContactGroupStore.getState().offset !== -1);

	const findCallback = useCallback(() => {
		apiClient.findContactGroups(useContactGroupStore.getState().offset, folderId).then((result) => {
			addContactGroups(result.contactGroups);
			setOffset(
				result.hasMore ? useContactGroupStore.getState().offset + FIND_CONTACT_GROUP_LIMIT : -1
			);
			setHasMore(result.hasMore);
		});
	}, [addContactGroups, folderId, setOffset]);

	useEffect(() => {
		if (useContactGroupStore.getState().contactGroups.length > 0 || !isFirstRender.current) {
			return;
		}
		isFirstRender.current = false;
		findCallback();
	}, [findCallback]);

	const findMore = useCallback(() => {
		if (!hasMore) {
			throw new Error('No more nodes available');
		}
		findCallback();
	}, [findCallback, hasMore]);

	return {
		contactGroups: contactGroupsByFolder,
		hasMore,
		findMore
	};
};
