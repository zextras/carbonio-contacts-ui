/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { client } from '../network/client';
import { StoredDistributionList, useDistributionListsStore } from '../store/distribution-lists';

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
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, upsertDistributionList } = useDistributionListsStore();

	const findStoredMembersPage = useCallback(
		(items: Array<StoredDistributionList>) => items.find((item) => item.email === email)?.members,
		[email]
	);

	const storedDistributionListMembersPage = useMemo(
		() => distributionLists && findStoredMembersPage(distributionLists),
		[distributionLists, findStoredMembersPage]
	);

	const offsetRef = useRef<number>(0);

	const shouldLoadData = useMemo(
		() => storedDistributionListMembersPage === undefined,
		[storedDistributionListMembersPage]
	);

	const findCallback = useCallback(
		(offset: number) => {
			if (email) {
				client
					.getDistributionListMembers(email, { offset, limit })
					.then(({ total, members, more }) => {
						offsetRef.current += members.length;
						const storedLists = useDistributionListsStore.getState().distributionLists;
						const previousMembers =
							(storedLists && findStoredMembersPage(storedLists)?.members) ?? [];
						upsertDistributionList({
							email,
							members: {
								members: offset === 0 ? members : [...previousMembers, ...members],
								more,
								total
							},
							canRequireMembers: true
						});
					})
					.catch(() => {
						createSnackbar({
							key: new Date().toDateString(),
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					});
			}
		},
		[createSnackbar, email, findStoredMembersPage, limit, t, upsertDistributionList]
	);

	useEffect(() => {
		if (shouldLoadData) {
			findCallback(0);
		}
	}, [findCallback, shouldLoadData]);

	const findMore = useCallback(() => {
		if (!storedDistributionListMembersPage?.more) {
			throw new Error('No more members available');
		}
		findCallback(offsetRef.current);
	}, [storedDistributionListMembersPage?.more, findCallback]);

	return {
		members: storedDistributionListMembersPage?.members ?? [],
		hasMore: storedDistributionListMembersPage?.more ?? false,
		totalMembers: storedDistributionListMembersPage?.total ?? 0,
		findMore
	};
};
