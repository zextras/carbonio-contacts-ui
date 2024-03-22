/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const searchContacts = createAsyncThunk('contacts/searchContacts', async ({folderId,itemId}: {folderId: string, itemId?: string}) => {
	let query = `inid:"${folderId}"`;
	if (itemId !== undefined) {
		query = `inid:"${folderId}" item:"${itemId}"`;
	}
	const { cn } = (await soapFetch('Search', {
		_jsns: 'urn:zimbraMail',
		limit: '500',
		offset: 0,
		sortBy: 'nameAsc',
		types: 'contact',
		query: {
			_content: `${query}`
		}
	})) as { cn: any };

	return cn;
});