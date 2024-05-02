/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { deleteFolder } from './delete-folder';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('deleteFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createAPIInterceptor('FolderAction');
		const folderId = faker.string.uuid();
		deleteFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'delete'
			},
			_jsns: NAMESPACES.mail
		});
	});
});