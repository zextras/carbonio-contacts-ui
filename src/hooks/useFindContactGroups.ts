/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { ContactGroup } from '../model/contact-group';
import { client } from '../network/client';

type UseFindContactGroupsReturnType = {
	contactGroups: Array<ContactGroup>;
	hasMore: boolean;
	findMore: () => void;
};

export const useFindContactGroups = (): UseFindContactGroupsReturnType => {
	const [contactGroups, setContactGroups] = useState<Array<ContactGroup>>([]);
	const offset = useRef<number>(0);
	const [hasMore, setHasMore] = useState(true);

	const findCallback = useCallback(() => {
		client.findContactGroups(offset.current).then(({ hasMore, contactGroups }) => {
			setContactGroups((oldNodes) => [...(oldNodes ?? []), ...(contactGroups ?? [])]);
			offset.current += FIND_CONTACT_GROUP_LIMIT;
			setHasMore(hasMore);
		});
	}, []);

	useEffect(() => {
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
