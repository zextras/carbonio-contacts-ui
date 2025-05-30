/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-ui-commons';

import { deleteContact } from './delete-contact';
import { FolderActionRequest } from './folder-action';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

describe('Delete contact', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest>('ContactAction');
		const contactsIds = ['32', '42', '77'];
		deleteContact(contactsIds);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: contactsIds.join(','),
				op: 'delete'
			},
			_jsns: JSNS.MAIL
		});
	});
});
