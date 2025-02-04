/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SEARCH_CONTACTS_LIMIT } from '../../../constants/api';
import {
	SearchContactsRequest,
	SearchContactsSoapRequest,
	SearchContactsSoapResponse
} from '../../../types';

export const searchContactsAsyncThunk = createAsyncThunk<
	SearchContactsSoapResponse,
	SearchContactsRequest
>('contacts/searchContacts', async ({ folderId, offset = 0, type = 'ALL' }) => {
	let queryContent = `inid:"${folderId}"`;
	if (type === 'CONTACT') {
		queryContent += ` and not #type:group`;
	} else if (type === 'CONTACT_GROUP') {
		queryContent += ` and #type:group`;
	}
	return soapFetch<SearchContactsSoapRequest, SearchContactsSoapResponse>('Search', {
		_jsns: 'urn:zimbraMail',
		limit: SEARCH_CONTACTS_LIMIT,
		offset,
		sortBy: 'nameAsc',
		types: 'contact',
		query: {
			_content: queryContent
		}
	});
});
