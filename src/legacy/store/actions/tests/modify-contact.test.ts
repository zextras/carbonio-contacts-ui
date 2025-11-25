/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { modifyContact } from 'legacy/store/actions/modify-contact';
import { buildContact } from 'tests/model-builder';
import { createSoapContact } from 'tests/utils';

describe('ModifyContact', () => {
	it('should call API with _jsns:zimbraMail', async () => {
		const soapAPIInterceptor = createSoapAPIInterceptor('ModifyContact', {
			cn: [createSoapContact()]
		});
		const contact = buildContact();

		modifyContact({ updatedContact: contact });

		const request = await soapAPIInterceptor;
		expect(request).toEqual(expect.objectContaining({ _jsns: 'urn:zimbraMail' }));
	});
});
