/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchContacts = createAsyncThunk('contacts/searchContacts', async (id: string) => {
	const { cn } = (await soapFetch('Search', {
		_jsns: 'urn:zimbraMail',
		limit: '500',
		offset: 0,
		sortBy: 'nameAsc',
		types: 'contact',
		query: {
			_content: `inid:"${id}"`
		}
	})) as { cn: any };

	return cn;
});
