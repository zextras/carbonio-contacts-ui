/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-shell-ui';

import { updateFolder, UpdateFolderParams } from './update-folder';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

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
			_jsns: JSNS.mail
		});
	});
});
