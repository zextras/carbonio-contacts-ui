/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { createMountpoints } from './create-mountpoints';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('createMountpoints', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createAPIInterceptor('Batch', response);
		expect(async () => {
			await createMountpoints([]);
		}).rejects.toThrow();
	});

	it('should call the API passing the correct static params', async () => {
		const interceptor = createAPIInterceptor('Batch');
		await createMountpoints();
		const request = await interceptor;
		expect(request).toEqual({
			_jsns: NAMESPACES.mail
		});
	});
});
