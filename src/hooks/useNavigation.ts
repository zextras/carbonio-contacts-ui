/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { usePushHistoryCallback, useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { GROUPS_ROUTE } from '../constants';

export type UseNavigationReturnType = {
	navigateTo: (path: string, options?: { replace?: boolean }) => void;
};

export const useNavigation = (): UseNavigationReturnType => {
	const pushHistory = usePushHistoryCallback();
	const replaceHistory = useReplaceHistoryCallback();

	const navigateTo = useCallback<UseNavigationReturnType['navigateTo']>(
		(path, options) => {
			if (options?.replace) {
				replaceHistory({
					route: GROUPS_ROUTE,
					path
				});
			} else {
				pushHistory({
					route: GROUPS_ROUTE,
					path
				});
			}
		},
		[pushHistory, replaceHistory]
	);

	return { navigateTo };
};
