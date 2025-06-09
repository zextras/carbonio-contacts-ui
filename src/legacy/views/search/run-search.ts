/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { RunSearchResults } from 'legacy/views/search/types';
import { normalizeContactsFromSoap } from 'legacy/utils/normalizations/normalize-contact-from-soap';

export const runSearch = ({
	queryString,
	offset,
	abortSignal
}: {
	queryString: string;
	offset: number;
	abortSignal?: AbortSignal;
}): Promise<RunSearchResults> =>
	soapFetch<any, any>(
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
