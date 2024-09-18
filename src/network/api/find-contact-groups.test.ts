/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FindContactGroupsSoapApiRequest, findSharedContactGroups } from './find-contact-groups';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';

describe('Find Contact Groups API', () => {
	it('should request contact groups of given account', async () => {
		const interceptor = createSoapAPIInterceptor<FindContactGroupsSoapApiRequest>('Search');

		await findSharedContactGroups('123', 0);

		const request = await interceptor;

		expect(request.query).toBe('#type:group inid:123:7');
	});
});
