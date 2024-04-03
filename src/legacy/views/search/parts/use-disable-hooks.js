/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { isEqualWith } from 'lodash';

export const useDisabled = ({
	queryToBe,
	query,
	isSharedFolderIncluded,
	isSharedFolderIncludedTobe
}) =>
	useMemo(
		() =>
			isSharedFolderIncluded !== isSharedFolderIncludedTobe
				? false
				: isEqualWith(queryToBe, query, (newQuery, currentQuery) => {
						if (newQuery.length === 0 && currentQuery.length === 0) return true;
						if (newQuery.length !== currentQuery.length) return false;
						return newQuery[0].value === currentQuery[0].value;
					}),
		[isSharedFolderIncluded, isSharedFolderIncludedTobe, query, queryToBe]
	);

export const useSecondaryDisabled = ({ tag, totalKeywords }) =>
	useMemo(() => totalKeywords === 0 && tag.length === 0, [tag.length, totalKeywords]);
