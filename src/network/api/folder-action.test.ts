/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { folderAction, FolderActionOperation, FolderActionParams } from 'network/api/folder-action';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('Folder action', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('FolderAction', response);
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
			_jsns: JSNS.MAIL
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
			_jsns: JSNS.MAIL
		});
	});
});
