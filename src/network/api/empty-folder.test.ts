/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { emptyFolder } from './empty-folder';
import { FolderActionRequest } from './folder-action';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('emptyFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createAPIInterceptor<FolderActionRequest>('FolderAction');
		const folderId = faker.string.uuid();
		emptyFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'empty'
			},
			_jsns: NAMESPACES.mail
		});
	});
});