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
import { StoredDistributionList, useDistributionListsStore } from '../store/distribution-lists';
import { OptionalPropertyOf } from '../types/utils';

export const useGetDistributionList = (id: string | undefined): DistributionList | undefined => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, upsertDistributionList } = useDistributionListsStore();

	const storedItem = useMemo(
		() => distributionLists.find((dl): dl is DistributionList => dl.id === id),
		[distributionLists, id]
	);
	const shouldLoadData = useMemo(() => {
		const requiredFields: Array<OptionalPropertyOf<StoredDistributionList>> = [
			'displayName',
			'owners',
			'description',
			'isMember',
			'isOwner'
		];
		return (
			storedItem === undefined || some(requiredFields, (field) => storedItem[field] === undefined)
		);
	}, [storedItem]);

	useEffect(() => {
		if (shouldLoadData && id !== undefined) {
			client
				.getDistributionList({ id })
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
	}, [createSnackbar, id, shouldLoadData, t, upsertDistributionList]);

	return storedItem;
};
