/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { folderAction, FolderActionOperation, FolderActionParams } from './folder-action';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('Folder action', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createAPIInterceptor('folderAction', response);
		expect(async () => {
			await folderAction({ folderId: faker.string.uuid(), operation: 'delete' });
		}).rejects.toThrow();
	});

	it('should set the proper fields in the request', () => {
		const apiInterceptor = createAPIInterceptor('FolderAction');
		const params = {
			folderId: faker.string.uuid(),
			operation: 'delete' as FolderActionOperation,
			recursive: false,
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
				recursive: params.recursive,
				l: params.parentId,
				zid: params.granteeId,
				name: params.name,
				color: params.color
			},
			_jsns: NAMESPACES.mail
		});
	});

	it('should set only the optional fields which have a corresponding field in the params', () => {
		const apiInterceptor = createAPIInterceptor('FolderAction');
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
			_jsns: NAMESPACES.mail
		});
	});
});
