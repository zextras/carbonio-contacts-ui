/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS, SoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponseResolver, http, HttpResponse } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import {
	CONTACT_ACTION_OPERATION,
	ContactActionRequest,
	ContactActionResponse
} from '../../network/api/contact-action';
import { buildSoapError, buildSoapResponse } from '../utils';

type DeleteContactHandler = HttpResponseResolver<
	never,
	{ Body: { ContactActionRequest: ContactActionRequest } },
	SoapResponse<ContactActionResponse>
>;
export const registerDeleteContactHandler = (
	id: string,
	error?: string
): jest.Mock<ReturnType<DeleteContactHandler>, Parameters<DeleteContactHandler>> => {
	const handler = jest.fn<ReturnType<DeleteContactHandler>, Parameters<DeleteContactHandler>>(
		() => {
			if (error) {
				return HttpResponse.json(buildSoapError(error));
			}
			return HttpResponse.json(
				buildSoapResponse<ContactActionResponse>({
					ContactActionResponse: {
						action: { id, op: CONTACT_ACTION_OPERATION.delete },
						_jsns: JSNS.mail
					}
				})
			);
		}
	);
	getSetupServer().use(
		http.post<
			never,
			{ Body: { ContactActionRequest: ContactActionRequest } },
			SoapResponse<ContactActionResponse>
		>('/service/soap/ContactActionRequest', handler)
	);

	return handler;
};
