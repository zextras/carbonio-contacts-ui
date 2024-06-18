/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import { exportContacts, ExportContactsRequest, ExportContactsResponse } from './export-contacts';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('exportContacts', () => {
	it('should call the export contacts API with the correct parameters', async () => {
		const folderId = faker.string.uuid();
		const expectedRequest = {
			_jsns: 'urn:zimbraMail',
			csvfmt: 'thunderbird-csv',
			ct: 'csv',
			l: folderId
		};

		const interceptor = createSoapAPIInterceptor<ExportContactsRequest>('ExportContacts');
		exportContacts(folderId);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual(expectedRequest);
	});

	it('should return the nromalized response of the API response if successful', async () => {
		const content = faker.string.alphanumeric();
		const response = {
			content: [
				{
					_content: content
				}
			],
			_jsns: JSNS.mail
		};

		createSoapAPIInterceptor<ExportContactsRequest, ExportContactsResponse>(
			'ExportContacts',
			response
		);
		await expect(exportContacts(faker.string.uuid())).resolves.toEqual(content);
	});

	it('should throw an error if the API responds with a fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor<ExportContactsRequest, ErrorSoapBodyResponse>(
			'ExportContacts',
			response
		);
		expect(async () => {
			await exportContacts(faker.string.uuid());
		}).rejects.toThrow();
	});
});
