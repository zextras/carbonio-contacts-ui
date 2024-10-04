/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useMemo, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { apiClient } from '../network/api-client';
import { StoredDistributionList, useDistributionListsStore } from '../store/distribution-lists';
import { OptionalPropertyOf } from '../types/utils';

export const REQUIRED_FIELDS: Array<OptionalPropertyOf<StoredDistributionList>> = [
	'id',
	'displayName',
	'owners',
	'description',
	'isMember',
	'isOwner'
];

export const useGetDistributionList = (
	{ id, email }: Partial<Pick<DistributionList, 'id' | 'email'>>,
	{ skip }: { skip?: boolean } = {}
): {
	distributionList: DistributionList | undefined;
	loading: boolean;
} => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, upsertDistributionList } = useDistributionListsStore();
	const [loading, setLoading] = useState(false);

	const storedItem = useMemo(
		() =>
			distributionLists?.find(
				(dl): dl is DistributionList => (dl.id === id || dl.email === email) && dl.id !== undefined
			),
		[distributionLists, email, id]
	);

	const [distributionList, setDistributionList] = useState<DistributionList | undefined>();

	const shouldLoadData = useMemo(
		() =>
			storedItem === undefined || some(REQUIRED_FIELDS, (field) => storedItem[field] === undefined),
		[storedItem]
	);

	useEffect(() => {
		if (shouldLoadData && !skip) {
			setLoading(true);
			apiClient
				.getDistributionList({ id, email })
				.then((dl) => {
					if (dl) {
						setDistributionList(dl);
						upsertDistributionList(dl);
					}
				})
				.catch(() => {
					createSnackbar({
						key: new Date().toDateString(),
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [createSnackbar, email, id, shouldLoadData, skip, t, upsertDistributionList]);

	return { distributionList: storedItem ?? distributionList, loading };
};
