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

type UseGetDistributionListMembersReturnType = DistributionListMembersPage & {
	findMore: () => void;
	loading: boolean;
};

export const useGetDistributionListMembers = (
	email: string,
	limit?: number
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
			offsetRef.current += newState.members.length;
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

	const shouldLoadData = useMemo(
		() => storedDistributionListMembersPage === undefined,
		[storedDistributionListMembersPage]
	);

	const findCallback = useCallback(
		(offset: number) => {
			if (email) {
				setLoading(true);
				client
					.getDistributionListMembers(email, { offset, limit })
					.then((newMembersPage) => {
						updateDistributionListMembersPage(newMembersPage, offset);
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
					})
					.finally(() => {
						setLoading(false);
					});
			}
		},
		[createSnackbar, email, limit, t, updateDistributionListMembersPage]
	);

	useEffect(() => {
		if (shouldLoadData) {
			findCallback(0);
		}
	}, [findCallback, shouldLoadData]);

	const findMore = useCallback(() => {
		if (!distributionListMembersPage?.more) {
			throw new Error('No more members available');
		}
		findCallback(offsetRef.current);
	}, [distributionListMembersPage?.more, findCallback]);

	return {
		members: distributionListMembersPage?.members ?? [],
		more: distributionListMembersPage?.more ?? false,
		total: distributionListMembersPage?.total ?? 0,
		findMore,
		loading
	};
};
