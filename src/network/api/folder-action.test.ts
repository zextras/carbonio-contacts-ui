/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import { folderAction, FolderActionOperation, FolderActionParams } from './folder-action';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('Folder action', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('folderAction', response);
		expect(async () => {
			await folderAction({ folderId: faker.string.uuid(), operation: 'delete' });
		}).rejects.toThrow();
	});

	it('should set the proper fields in the request', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const params = {
			folderId: faker.string.uuid(),
			operation: 'delete' as FolderActionOperation,
			parentId: faker.string.uuid(),
			granteeId: faker.string.uuid(),
			name: faker.word.words(2),
			color: faker.number.int({ min: 0, max: 127 })
		};
		folderAction(params);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: params.folderId,
				op: params.operation,
				l: params.parentId,
				zid: params.granteeId,
				name: params.name,
				color: params.color
			},
			_jsns: JSNS.mail
		});
	});

	it('should set only the optional fields which have a corresponding field in the params', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const params: FolderActionParams = {
			folderId: faker.string.uuid(),
			operation: 'delete' as FolderActionOperation
		};
		folderAction(params);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: params.folderId,
				op: params.operation
			},
			_jsns: JSNS.mail
		});
	});
});
