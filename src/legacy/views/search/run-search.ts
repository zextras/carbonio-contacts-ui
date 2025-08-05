/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { normalizeContactsFromSoap } from 'legacy/utils/normalizations/normalize-contact-from-soap';
import { RunSearchResults } from 'legacy/views/search/types';

export const runSearch = ({
	queryString,
	offset,
	abortSignal
}: {
	queryString: string;
	offset: number;
	abortSignal?: AbortSignal;
}): Promise<RunSearchResults> =>
	legacySoapFetch<any, any>(
		'Search',
		{
			limit: 100,
			query: queryString,
			offset,
			sortBy: 'nameAsc',
			types: 'contact',
			_jsns: 'urn:zimbraMail'
		},
		undefined,
		abortSignal
	).then(({ cn, more }) => ({
		contacts: [...normalizeContactsFromSoap(cn)],
		offset: offset + 100,
		more
	}));
