/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import {
	BatchUpdateFolderRequest,
	BatchUpdateFolderResponse,
	updateFolder,
	UpdateFolderParams
} from 'network/api/update-folder';

describe('updateFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const params: UpdateFolderParams = {
			folderId: faker.string.uuid(),
			name: faker.word.words(1),
			parentId: `${faker.number.int({ min: 1 })}`,
			color: faker.number.int({ min: 0, max: 127 })
		};
		updateFolder(params);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: params.folderId,
				name: params.name,
				l: params.parentId,
				color: params.color,
				op: 'update'
			},
			_jsns: JSNS.MAIL
		});
	});

	it('should batch the update with a separate color action when an rgb is given', async () => {
		const apiInterceptor = createSoapAPIInterceptor<BatchUpdateFolderRequest>('Batch');
		const folderId = faker.string.uuid();

		updateFolder({ folderId, name: 'renamed', rgb: '#123456' });

		await expect(apiInterceptor).resolves.toEqual({
			onerror: 'continue',
			FolderActionRequest: [
				{ action: { id: folderId, name: 'renamed', op: 'update' }, _jsns: JSNS.MAIL },
				{ action: { id: folderId, rgb: '#123456', op: 'color' }, _jsns: JSNS.MAIL }
			],
			_jsns: JSNS.ALL
		});
	});

	it('should reject with the fault reasons when the batch fails', async () => {
		const reason = faker.lorem.sentence();
		createSoapAPIInterceptor<BatchUpdateFolderRequest, BatchUpdateFolderResponse>('Batch', {
			Fault: [
				{
					Code: { Value: faker.string.uuid() },
					Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.sample() } },
					Reason: { Text: reason }
				}
			],
			_jsns: JSNS.ALL
		});

		await expect(updateFolder({ folderId: faker.string.uuid(), rgb: '#123456' })).rejects.toThrow(
			reason
		);
	});
});
