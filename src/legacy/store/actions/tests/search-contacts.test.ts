/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { generateStore } from '../../../tests/generators/store';
import { searchContactsAsyncThunk } from '../search-contacts';

describe('searchContacts', () => {
	it('should search contacts with default parameters', async () => {
		const store = generateStore();
		const interceptor = createSoapAPIInterceptor('Search', {});

		// not interested in the proper type of the action
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		store.dispatch(searchContactsAsyncThunk({ folderId: '123' }));
		const request = await interceptor;

		expect(request).toStrictEqual({
			_jsns: 'urn:zimbraMail',
			limit: 100,
			offset: 0,
			query: { _content: 'inid:"123"' },
			sortBy: 'nameAsc',
			types: 'contact'
		});
	});

	it('should search contacts with custom offset', async () => {
		const store = generateStore();
		const interceptor = createSoapAPIInterceptor('Search', {});

		// not interested in the proper type of the action
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		store.dispatch(searchContactsAsyncThunk({ folderId: '123', offset: 10 }));
		const request = await interceptor;

		expect(request).toStrictEqual({
			_jsns: 'urn:zimbraMail',
			limit: 100,
			offset: 10,
			query: { _content: 'inid:"123"' },
			sortBy: 'nameAsc',
			types: 'contact'
		});
	});
});
