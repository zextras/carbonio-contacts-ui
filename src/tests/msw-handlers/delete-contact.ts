/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';
import { HttpResponseResolver, http, HttpResponse } from 'msw';
import { Mock } from 'vitest';

import { getSetupServer } from '@jest-setup';
import {
	CONTACT_ACTION_OPERATION,
	ContactActionRequest,
	ContactActionResponse
} from 'network/api/contact-action';
import { buildSoapError, buildSoapResponse } from 'tests/utils';

type DeleteContactHandler = HttpResponseResolver<
	never,
	{ Body: { ContactActionRequest: ContactActionRequest } },
	SoapResponse<ContactActionResponse>
>;

export const registerDeleteContactHandler = (id: string, error?: string): Mock<DeleteContactHandler> => {
	const handler = vi.fn<DeleteContactHandler>(() => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}
		return HttpResponse.json(
			buildSoapResponse<ContactActionResponse>({
				ContactActionResponse: {
					action: { id, op: CONTACT_ACTION_OPERATION.delete },
					_jsns: JSNS.MAIL
				}
			})
		);
	});
	getSetupServer().use(
		http.post<
			never,
			{ Body: { ContactActionRequest: ContactActionRequest } },
			SoapResponse<ContactActionResponse>
		>('/service/soap/ContactActionRequest', handler)
	);

	return handler;
};
