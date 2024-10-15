/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SEARCH_CONTACTS_LIMIT } from '../../../constants/api';
import { SearchContactsRequest, SearchResponse } from '../../../types';

export const searchContacts = createAsyncThunk<SearchResponse, SearchContactsRequest>(
	'contacts/searchContacts',
	async ({ folderId, offset = 0 }) =>
		(await soapFetch('Search', {
			_jsns: 'urn:zimbraMail',
			limit: SEARCH_CONTACTS_LIMIT,
			offset,
			sortBy: 'nameAsc',
			types: 'contact',
			query: {
				_content: `inid:"${folderId}"`
			}
		})) as SearchResponse
);
