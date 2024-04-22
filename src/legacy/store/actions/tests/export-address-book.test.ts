/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { ExportContactsRequest } from '../../../types/contact';
import { exportContacts } from '../export-address-book';

describe('exportAddressBook', () => {
	const folderId = 'testFolderId';
	const request: ExportContactsRequest = { folderId };

	it('export contacts api is called with the correct parameters', async () => {
		const expectedRequest = {
			_jsns: 'urn:zimbraMail',
			csvfmt: 'thunderbird-csv',
			ct: 'csv',
			l: 'testFolderId'
		};

		const interceptor = createSoapAPIInterceptor<ExportContactsRequest>('ExportContacts');
		exportContacts(request);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual(expectedRequest);
	});
});
