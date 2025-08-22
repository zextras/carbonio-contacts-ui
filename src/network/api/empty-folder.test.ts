/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { emptyFolder } from 'network/api/empty-folder';
import { FolderActionRequest } from 'network/api/folder-action';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('emptyFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest>('FolderAction');
		const folderId = faker.string.uuid();
		emptyFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'empty',
				recursive: true,
				type: 'contacts'
			},
			_jsns: JSNS.MAIL
		});
	});
});
