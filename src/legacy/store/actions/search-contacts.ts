/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SEARCH_CONTACTS_LIMIT } from '../../../constants/api';
import { SearchResponse } from '../../../types';

export const searchContacts = createAsyncThunk<SearchResponse, string>(
	'contacts/searchContacts',
	async (id: string) =>
		(await soapFetch('Search', {
			_jsns: 'urn:zimbraMail',
			limit: SEARCH_CONTACTS_LIMIT,
			offset: 0,
			sortBy: 'nameAsc',
			types: 'contact',
			query: {
				_content: `inid:"${id}"`
			}
		})) as SearchResponse
);
