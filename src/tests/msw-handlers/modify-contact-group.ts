/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver, http } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { ModifyContactRequest, ModifyContactResponse } from '../../network/api/modify-contact';
import { CnItem } from '../../network/api/types';
import { buildSoapError, buildSoapResponse, createCnItem } from '../utils';

type ModifyContactGroupHandler = HttpResponseResolver<
	never,
	{ Body: { ModifyContactRequest: ModifyContactRequest } },
	SoapResponse<ModifyContactResponse>
>;
export const registerModifyContactGroupHandler = (
	cnItem: CnItem = createCnItem(),
	error: string | undefined = undefined
): jest.Mock<ReturnType<ModifyContactGroupHandler>, Parameters<ModifyContactGroupHandler>> => {
	const handler = jest.fn<
		ReturnType<ModifyContactGroupHandler>,
		Parameters<ModifyContactGroupHandler>
	>(() => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}
		return HttpResponse.json(
			buildSoapResponse<ModifyContactResponse>({
				ModifyContactResponse: {
					cn: [cnItem],
					_jsns: NAMESPACES.mail
				}
			})
		);
	});
	getSetupServer().use(
		http.post<
			never,
			{ Body: { ModifyContactRequest: ModifyContactRequest } },
			SoapResponse<ModifyContactResponse>
		>('/service/soap/ModifyContactRequest', handler)
	);

	return handler;
};
