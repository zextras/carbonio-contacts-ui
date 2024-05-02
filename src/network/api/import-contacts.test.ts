/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import {
	importContacts,
	ImportContactsParams,
	ImportContactsRequest,
	ImportContactsResponse,
	ImportContactsResult
} from './import-contacts';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('importAddressBook', () => {
	const folderId = 'testFolderId';
	const aid = 'testAid';
	const importParams: ImportContactsParams = { folderId, aid };

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

		const interceptor = createSoapAPIInterceptor<ImportContactsRequest>('ImportContacts');
		importContacts(importParams);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual(expectedRequest);
	});

	it('should return the normalized response of the API response if successful', async () => {
		const ids = faker.helpers.multiple(faker.number.int, { count: { min: 1, max: 99999 } });
		const response = {
			cn: [
				{
					n: ids.length,
					ids: ids.map((id) => `${id}`).join(',')
				}
			],
			_jsns: NAMESPACES.mail
		};

		createSoapAPIInterceptor<ImportContactsRequest, ImportContactsResponse>(
			'ImportContacts',
			response
		);
		await expect(importContacts(importParams)).resolves.toEqual(response);
	});

	it('should return a default normalized response if the API responds with an empty result', async () => {
		const result: ImportContactsResult = {
			contactsCount: 0,
			contactsIds: []
		};
		const response = {
			cn: [],
			_jsns: NAMESPACES.mail
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
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
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
