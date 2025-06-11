/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { deleteFolder } from 'network/api/delete-folder';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('deleteFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const folderId = faker.string.uuid();
		deleteFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'delete'
			},
			_jsns: JSNS.MAIL
		});
	});
});
