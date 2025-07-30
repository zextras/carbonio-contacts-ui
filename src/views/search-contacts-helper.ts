/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { SoapSearchResults } from 'legacy/views/search/types';

export const searchContactsHelper = ({
	query,
	offset,
	sortBy
}: {
	query: { _content: string };
	offset: number;
	sortBy: string;
}): Promise<SoapSearchResults> =>
	legacySoapFetch<any, any>('Search', {
		limit: 100,
		query,
		offset,
		sortBy,
		types: 'contact',
		_jsns: 'urn:zimbraMail'
	}).then(({ cn, more, offset }) => ({
		query: query._content,
		more,
		cn,
		offset: (offset ?? 0) + 100,
		sortBy: sortBy ?? 'nameAsc'
	}));
