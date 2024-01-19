/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { ContactGroup } from '../model/contact-group';
import { client } from '../network/client';
import { useContactGroupStore } from '../store/contact-groups';

type UseFindContactGroupsReturnType = {
	contactGroups: Array<ContactGroup>;
	hasMore: boolean;
	findMore: () => void;
};

export const useFindContactGroups = (): UseFindContactGroupsReturnType => {
	const { addStoredContactGroups, setStoredOffset } = useContactGroupStore();
	const [contactGroups, setContactGroups] = useState<Array<ContactGroup>>(
		useContactGroupStore.getState().storedContactGroups
	);
	const offset = useRef<number>(useContactGroupStore.getState().storedOffset);
	const [hasMore, setHasMore] = useState(useContactGroupStore.getState().storedOffset !== -1);

	const findCallback = useCallback(() => {
		client.findContactGroups(offset.current).then((result) => {
			addStoredContactGroups(result.contactGroups);
			setContactGroups((oldNodes) => [...(oldNodes ?? []), ...(result.contactGroups ?? [])]);
			offset.current += FIND_CONTACT_GROUP_LIMIT;
			setStoredOffset(result.hasMore ? offset.current : -1);
			setHasMore(result.hasMore);
		});
	}, [addStoredContactGroups, setStoredOffset]);

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

	return { contactGroups, hasMore, findMore };
};
