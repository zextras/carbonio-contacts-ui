/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../../constants/api';
import { GenericSoapPayload } from '../../../network/api/types';
import { buildSoapError, buildSoapResponse } from '../../../tests/utils';

interface CreateContactRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	cn: {
		l: string;
		a: string;
	};
}

interface CreateContactResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	cn: [
		{
			l: string;
			id: string;
		}
	];
}

type CreateContactHandler = ResponseResolver<
	RestRequest<{ Body: { CreateContactRequest: CreateContactRequest } }>,
	RestContext,
	SoapResponse<CreateContactResponse>
>;

export const registerCreateContactHandler = (
	folderId?: string,
	contactId?: string,
	error?: string
): jest.Mock<ReturnType<CreateContactHandler>, Parameters<CreateContactHandler>> => {
	const handler = jest.fn<ReturnType<CreateContactHandler>, Parameters<CreateContactHandler>>(
		async (req, res, ctx) => {
			if (error) {
				return res(ctx.json(buildSoapError(error)));
			}

			return res(
				ctx.json(
					buildSoapResponse<CreateContactResponse>({
						CreateContactResponse: {
							_jsns: 'urn:zimbraMail',
							cn: [
								{
									id: contactId ?? faker.string.uuid(),
									l: folderId ?? faker.string.uuid()
								}
							]
						}
					})
				)
			);
		}
	);

	getSetupServer().use(
		rest.post<
			{ Body: { CreateContactRequest: CreateContactRequest } },
			never,
			SoapResponse<CreateContactResponse>
		>('/service/soap/CreateContactRequest', handler)
	);

	return handler;
};
