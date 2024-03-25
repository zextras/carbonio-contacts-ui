/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchContacts = createAsyncThunk('contacts/searchContacts', async (
	{
		folderId,
		itemId,
		limit,
		offset
	} : {
		folderId: string,
		itemId?: string,
		limit?: number,
		offset?: number
	}) => {

		let query = `inid:"${folderId}" not #type:group`;

		if (typeof limit == 'undefined') {
			limit = 100;
		}

		if (typeof offset == 'undefined') {
			offset = 0;
		}

		if (typeof itemId != 'undefined') {
			query = query + ` item:"${itemId}"`;
		}

		const {cn} = (await soapFetch('Search', {
			_jsns: 'urn:zimbraMail',
			limit: limit,
			offset: offset,
			sortBy: 'nameAsc',
			types: 'contact',
			query: {
				_content: `${query}`
			}
		})) as {cn:any};

		return cn;
});