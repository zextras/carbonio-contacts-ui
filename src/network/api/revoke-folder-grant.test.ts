/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { revokeFolderGrant } from './revoke-folder-grant';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('revokeFolderGrant', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const folderId = faker.string.uuid();
		const granteeId = faker.string.uuid();
		revokeFolderGrant(folderId, granteeId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: folderId,
				op: '!grant',
				zid: granteeId
			},
			_jsns: NAMESPACES.mail
		});
	});
});
