/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { trashFolder } from './trash-folder';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('trashFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const folderId = faker.string.uuid();
		trashFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'trash'
			},
			_jsns: JSNS.MAIL
		});
	});
});
