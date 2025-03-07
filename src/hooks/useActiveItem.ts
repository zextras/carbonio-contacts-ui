/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { RouteParams, ROUTES_INTERNAL_PARAMS } from '../constants';

export type UseActiveItemReturnType = {
	activeItem: string | undefined;
	isActive: (id: string) => boolean;
	setActive: (id: string, options?: { replace?: boolean }) => void;
	removeActive: (options?: { replace?: boolean }) => void;
};

export const useActiveItem = (): UseActiveItemReturnType => {
	const navigate = useNavigate();
	const { id, filter } = useParams<RouteParams>();
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

	const setActive = useCallback<UseActiveItemReturnType['setActive']>(
		(itemId, options) => {
			navigate(
				`../${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${filter ?? ''}/${itemId}`,
				options
			);
		},
		[filter, navigate]
	);

	const removeActive = useCallback<UseActiveItemReturnType['removeActive']>(
		(options) => {
			navigate(`../${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${filter ?? ''}`, options);
		},
		[filter, navigate]
	);

	return { activeItem: id, isActive, setActive, removeActive };
};
