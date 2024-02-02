/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useMemo, useRef } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { filter } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';
import { client } from '../network/client';
import { useDistributionListsStore } from '../store/distribution-lists';

export const useFindDistributionLists = ({
	ownerOf,
	memberOf
}: {
	ownerOf: boolean;
	memberOf: boolean;
}): Array<DistributionList> => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { distributionLists, setDistributionLists } = useDistributionListsStore();
	const shouldLoadDataRef = useRef(true);

	useEffect(() => {
		// Since we need
		// to ask all distribution lists of the account to have both the isOwner and isMember info,
		// perform the request only once, and then filter the results based on the requested filter.
		if (shouldLoadDataRef.current) {
			client
				.getAccountDistributionLists({ ownerOf: true, memberOf: true })
				.then((response) => {
					setDistributionLists(response);
					shouldLoadDataRef.current = false;
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
	}, [createSnackbar, setDistributionLists, t]);

	return useMemo(
		() =>
			filter(
				distributionLists,
				(item) => (ownerOf && item.isOwner) || (memberOf && item.isMember === true)
			),
		[distributionLists, memberOf, ownerOf]
	);
};
