/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { FolderActionRequest } from 'network/api/folder-action';
import { moveContact } from 'network/api/move-contact';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

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
			_jsns: JSNS.MAIL
		});
	});
});
