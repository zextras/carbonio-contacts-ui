/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';

export const useFindDistributionLists = ({
	ownerOf,
	memberOf
}: {
	ownerOf: boolean;
	memberOf: boolean;
}): Array<DistributionList> => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [items, setItems] = useState<Array<DistributionList>>([]);

	useEffect(() => {
		setItems([]);
		client
			.getAccountDistributionLists({ ownerOf, memberOf })
			.then((newItems) => {
				setItems(newItems);
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
	}, [createSnackbar, memberOf, ownerOf, t]);

	return items;
};
