/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';

import { FolderActionRequest } from './folder-action';
import { trashContacts } from './trash-contacts';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('Trash contacts', () => {
	it('should call the API with the proper fields', () => {
		const apiInterceptor = createSoapAPIInterceptor<FolderActionRequest>('ContactAction');
		const contactsIds = ['32', '42', '77'];
		trashContacts(contactsIds);
		expect(apiInterceptor).resolves.toEqual({
			action: {
				id: contactsIds.join(','),
				op: 'trash'
			},
			_jsns: JSNS.mail
		});
	});
});
