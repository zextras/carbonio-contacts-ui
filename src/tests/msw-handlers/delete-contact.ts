/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import {
	CONTACT_ACTION_OPERATION,
	ContactActionRequest,
	ContactActionResponse
} from '../../network/api/contact-action';
import { buildSoapResponse } from '../utils';

type DeleteContactHandler = ResponseResolver<
	RestRequest<{ Body: { ContactActionRequest: ContactActionRequest } }>,
	RestContext,
	SoapResponse<ContactActionResponse>
>;
export const registerDeleteContactHandler = (
	id: string
): jest.Mock<ReturnType<DeleteContactHandler>, Parameters<DeleteContactHandler>> => {
	const handler = jest.fn<ReturnType<DeleteContactHandler>, Parameters<DeleteContactHandler>>(
		(req, res, ctx) =>
			res(
				ctx.json(
					buildSoapResponse<ContactActionResponse>({
						ContactActionResponse: {
							action: { id, op: CONTACT_ACTION_OPERATION.delete },
							_jsns: NAMESPACES.mail
						}
					})
				)
			)
	);
	getSetupServer().use(
		rest.post<
			{ Body: { ContactActionRequest: ContactActionRequest } },
			never,
			SoapResponse<ContactActionResponse>
		>('/service/soap/ContactActionRequest', handler)
	);

	return handler;
};
