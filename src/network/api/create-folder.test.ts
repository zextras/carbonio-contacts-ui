/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { createFolder, CreateFolderParams } from './create-folder';
import { FOLDERS } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('Create folder', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('CreateFolder', response);
		expect(async () => {
			await createFolder({ parentFolderId: FOLDERS.CONTACTS, name: faker.word.noun() });
		}).rejects.toThrow();
	});

	it('should set the proper fields in the request', () => {
		const apiInterceptor = createSoapAPIInterceptor('CreateFolder');
		const params: CreateFolderParams = {
			parentFolderId: faker.string.uuid(),
			name: faker.word.words(2)
		};
		createFolder(params);
		expect(apiInterceptor).resolves.toEqual({
			folder: {
				view: 'contact',
				l: params.parentFolderId,
				name: params.name
			},
			_jsns: NAMESPACES.mail
		});
	});
});
