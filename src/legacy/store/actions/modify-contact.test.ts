/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { modifyContact } from './modify-contact';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { buildContact } from '../../../tests/model-builder';
import { createSoapContact } from '../../../tests/utils';

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
