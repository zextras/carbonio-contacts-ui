/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { ImportAddressBookRequest } from '../../../types/import-address-book';
import { importAddressBook } from '../import-address-book';

describe('importAddressBook', () => {
	const folderId = 'testFolderId';
	const aid = 'testAid';
	const request: ImportAddressBookRequest = { folderId, aid };

	it('api is called with the correct parameters', async () => {
		const expectedRequest = {
			_jsns: 'urn:zimbraMail',
			content: {
				aid: 'testAid'
			},
			csvfmt: 'thunderbird-csv',
			ct: 'csv',
			l: 'testFolderId'
		};

		const interceptor = createAPIInterceptor<ImportAddressBookRequest>('ImportContacts');
		importAddressBook(request);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual(expectedRequest);
	});
});
