/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-shell-ui';

import { FolderActionRequest } from './folder-action';
import { moveContact } from './move-contact';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('Move contact', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest>('ContactAction');
		const contactsIds = ['32', '42', '77'];
		const folderId = faker.string.uuid();
		moveContact(contactsIds, folderId);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: contactsIds.join(','),
				op: 'move',
				l: folderId
			},
			_jsns: JSNS.mail
		});
	});
});
