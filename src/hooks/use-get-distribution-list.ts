/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { RequireAtLeastOne } from '../types/utils';

export const useGetDistributionList = (
	item: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>> | undefined
): DistributionList | undefined => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [distributionList, setDistributionList] = useState<DistributionList | undefined>();

	useEffect(() => {
		setDistributionList(undefined);
		if (item !== undefined) {
			client
				.getDistributionList(item)
				.then((dl) => {
					setDistributionList(dl);
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
	}, [createSnackbar, item, t]);

	return distributionList;
};
