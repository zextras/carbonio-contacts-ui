/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import {
	importContacts,
	ImportContactsParams,
	ImportContactsRequest,
	ImportContactsResponse,
	ImportContactsResult
} from './import-contacts';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('importAddressBook', () => {
	const folderId = 'testFolderId';
	const aid = 'testAid';
	const importParams: ImportContactsParams = { folderId, aid };

	it('api is called with the correct parameters', async () => {
		const expectedRequest = {
			_jsns: JSNS.mail,
			content: {
				aid: 'testAid'
			},
			csvfmt: 'thunderbird-csv',
			ct: 'csv',
			l: 'testFolderId'
		};

		const interceptor = createSoapAPIInterceptor<ImportContactsRequest>('ImportContacts');
		importContacts(importParams);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual(expectedRequest);
	});

	it('should return the normalized response of the API response if successful', async () => {
		const ids = faker.helpers
			.multiple(faker.number.int, { count: { min: 1, max: 99 } })
			.map((id) => `${id}`);
		const soapResponse = {
			cn: [
				{
					n: ids.length,
					ids: ids.join(',')
				}
			],
			_jsns: JSNS.mail
		};

		createSoapAPIInterceptor<ImportContactsRequest, ImportContactsResponse>(
			'ImportContacts',
			soapResponse
		);

		const apiResponse: ImportContactsResult = {
			contactsCount: ids.length,
			contactsIds: ids
		};

		await expect(importContacts(importParams)).resolves.toEqual(apiResponse);
	});

	it('should return a default normalized response if the API responds with an empty result', async () => {
		const result: ImportContactsResult = {
			contactsCount: 0,
			contactsIds: []
		};
		const response = {
			cn: [],
			_jsns: JSNS.mail
		};

		createSoapAPIInterceptor<ImportContactsRequest, ImportContactsResponse>(
			'ImportContacts',
			response
		);
		await expect(importContacts(importParams)).resolves.toEqual(result);
	});

	it('should throw an error if the API responds with a fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor<ImportContactsRequest, ErrorSoapBodyResponse>(
			'ImportContacts',
			response
		);
		expect(async () => {
			await importContacts(importParams);
		}).rejects.toThrow();
	});
});
