/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { useDistributionListsStore } from '../store/distribution-lists';
import { RequireAtLeastOne } from '../types/utils';

export const useGetDistributionList = (
	item: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>> | undefined
): DistributionList | undefined => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, upsertDistributionList } = useDistributionListsStore();

	const storedItem = useMemo(
		() => distributionLists.find((dl) => dl.id === item?.id || dl.email === item?.email),
		[distributionLists, item?.email, item?.id]
	);
	const shouldLoadData = useMemo(() => {
		const requiredFields: Array<keyof DistributionList> = [
			'displayName',
			'owners',
			'description',
			'isMember'
		];
		return (
			storedItem === undefined || some(requiredFields, (field) => storedItem[field] === undefined)
		);
	}, [storedItem]);

	useEffect(() => {
		if (shouldLoadData && item !== undefined) {
			client
				.getDistributionList(item)
				.then((dl) => {
					if (dl) {
						upsertDistributionList(dl);
					}
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
	}, [createSnackbar, item, shouldLoadData, t, upsertDistributionList]);

	return storedItem;
};
