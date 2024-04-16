/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { trashFolder } from './trash-folder';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('trashFolder', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createAPIInterceptor('FolderAction');
		const folderId = faker.string.uuid();
		trashFolder(folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: 'trash'
			},
			_jsns: NAMESPACES.mail
		});
	});
});
