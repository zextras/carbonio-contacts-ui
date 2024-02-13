/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionListMembersPage } from '../model/distribution-list';
import { client } from '../network/client';
import { StoredDistributionList, useDistributionListsStore } from '../store/distribution-lists';

type UseGetDistributionListMembersReturnType = Partial<DistributionListMembersPage> & {
	findMore: (limit?: number) => Promise<DistributionListMembersPage | undefined>;
	loading: boolean;
};

export const useGetDistributionListMembers = (
	email: string,
	{
		limit: initialLimit,
		skip
	}: {
		limit?: number;
		skip?: boolean;
	} = {}
): UseGetDistributionListMembersReturnType => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, upsertDistributionList } = useDistributionListsStore();
	const offsetRef = useRef<number>(0);
	const [innerDistributionListMembersPage, setInnerDistributionListMembersPage] = useState<
		DistributionListMembersPage | undefined
	>();
	const [loading, setLoading] = useState(false);

	const findStoredMembersPage = useCallback(
		(items: Array<StoredDistributionList>) => items.find((item) => item.email === email)?.members,
		[email]
	);

	const storedDistributionListMembersPage = useMemo(
		() => distributionLists && findStoredMembersPage(distributionLists),
		[distributionLists, findStoredMembersPage]
	);

	const distributionListMembersPage = useMemo(
		() => storedDistributionListMembersPage ?? innerDistributionListMembersPage,
		[storedDistributionListMembersPage, innerDistributionListMembersPage]
	);

	const updateDistributionListMembersPage = useCallback(
		(newState: DistributionListMembersPage, offset: number) => {
			offsetRef.current = offset + newState.members.length;
			setInnerDistributionListMembersPage((prevState) => ({
				members:
					offset === 0 ? newState.members : [...(prevState?.members ?? []), ...newState.members],
				more: newState.more,
				total: newState.total
			}));
			const storedMembers = findStoredMembersPage(
				useDistributionListsStore.getState().distributionLists ?? []
			);
			upsertDistributionList({
				email,
				members: {
					members:
						offset === 0
							? newState.members
							: [...(storedMembers?.members ?? []), ...newState.members],
					more: newState.more,
					total: newState.total
				},
				canRequireMembers: true
			});
		},
		[email, findStoredMembersPage, upsertDistributionList]
	);

	const loadMembers = useCallback(
		(offset: number, limit?: number): Promise<DistributionListMembersPage | undefined> => {
			if (email) {
				setLoading(true);
				return client
					.getDistributionListMembers(email, { offset, limit })
					.then((newMembersPage) => {
						updateDistributionListMembersPage(newMembersPage, offset);
						return newMembersPage;
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
						return undefined;
					})
					.finally(() => {
						setLoading(false);
					});
			}
			return Promise.reject(
				new Error(`Cannot load members of distribution list. Invalid email: "${email}"`)
			);
		},
		[createSnackbar, email, t, updateDistributionListMembersPage]
	);

	const shouldLoadFirstPage = useMemo(() => {
		const dataIsPartial =
			storedDistributionListMembersPage === undefined ||
			(initialLimit !== undefined &&
				initialLimit > 0 &&
				storedDistributionListMembersPage.members.length < initialLimit &&
				storedDistributionListMembersPage.more);

		return !skip && dataIsPartial;
	}, [initialLimit, skip, storedDistributionListMembersPage]);

	useEffect(() => {
		if (shouldLoadFirstPage) {
			loadMembers(0, initialLimit);
		}
	}, [loadMembers, initialLimit, shouldLoadFirstPage]);

	const findMore = useCallback<UseGetDistributionListMembersReturnType['findMore']>(
		(limit = initialLimit) => {
			if (distributionListMembersPage?.more === false) {
				throw new Error('No more members available');
			}
			return loadMembers(offsetRef.current, limit);
		},
		[distributionListMembersPage?.more, loadMembers, initialLimit]
	);

	return {
		members: distributionListMembersPage?.members,
		more: distributionListMembersPage?.more,
		total: distributionListMembersPage?.total,
		findMore,
		loading
	};
};
