/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { SoapSearchResults } from 'legacy/views/search/types';
import { SearchContactsSoapRequest, SearchContactsSoapResponse } from 'types';

export const searchContactsHelper = ({
	query,
	offset,
	sortBy,
	cursor
}: {
	query: { _content: string };
	offset: number;
	sortBy: string;
	cursor?: { sortVal: string; endSortVal?: string };
}): Promise<SoapSearchResults> =>
	legacySoapFetch<SearchContactsSoapRequest, SearchContactsSoapResponse>('Search', {
		limit: 100,
		query,
		offset,
		sortBy,
		types: 'contact',
		_jsns: 'urn:zimbraMail',
		// bounds the sort range for the letter filter; id is fixed at 0 since paging
		// is done through offset instead of anchoring the cursor on the last seen item
		...(cursor && {
			sortVal: cursor.sortVal,
			endSortVal: cursor.endSortVal,
			cursor: { id: 0, sortVal: cursor.sortVal, endSortVal: cursor.endSortVal }
		})
	}).then(({ cn, more, offset: responseOffset }) => ({
		query: query._content,
		more,
		cn,
		offset: (responseOffset ?? 0) + 100,
		sortBy: sortBy ?? 'nameAsc'
	}));
