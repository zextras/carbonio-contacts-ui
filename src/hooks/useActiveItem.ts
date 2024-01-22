/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useParams } from 'react-router-dom';

import { useNavigation, type UseNavigationReturnType } from './useNavigation';
import { RouteParams, ROUTES_INTERNAL_PARAMS } from '../constants';

export type UseActiveItemReturnType = {
	activeItem: string | undefined;
	isActive: (id: string) => boolean;
	setActive: (id: string, options?: Parameters<UseNavigationReturnType['navigateTo']>[1]) => void;
	removeActive: (options?: Parameters<UseNavigationReturnType['navigateTo']>[1]) => void;
};

export const useActiveItem = (): UseActiveItemReturnType => {
	const { navigateTo } = useNavigation();
	const { id, route, filter } = useParams<RouteParams>();
	const activeIdRef = useRef<string>();

	useEffect(() => {
		activeIdRef.current = id;
	}, [id]);

	/**
	 * Check if the given id matches the active id.
	 * The callback is memoized and is not recreated when the active item changes.
	 * Use activeItem field if you need the dependency to update.
	 */
	const isActive = useCallback<UseActiveItemReturnType['isActive']>(
		(itemId) => activeIdRef.current === itemId,
		[]
	);

	const currentPath = useMemo<string>(() => {
		if (route === ROUTES_INTERNAL_PARAMS.route.distributionLists) {
			return `${route}/${filter ?? ''}`;
		}
		return route ?? '';
	}, [filter, route]);

	const setActive = useCallback<UseActiveItemReturnType['setActive']>(
		(itemId, options) => {
			navigateTo(`${currentPath}/${itemId}`, options);
		},
		[currentPath, navigateTo]
	);

	const removeActive = useCallback<UseActiveItemReturnType['removeActive']>(
		(options) => {
			navigateTo(currentPath, options);
		},
		[currentPath, navigateTo]
	);

	return { activeItem: id, isActive, setActive, removeActive };
};
