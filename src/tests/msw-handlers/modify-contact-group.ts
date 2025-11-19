/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';
import { HttpResponse, HttpResponseResolver, http } from 'msw';
import { Mock } from 'vitest';

import { getSetupServer } from '@jest-setup';
import { ModifyContactRequest, ModifyContactResponse } from 'network/api/modify-contact';
import { CnItem } from 'network/api/types';
import { buildSoapError, buildSoapResponse, createSoapContactGroup } from 'tests/utils';

type ModifyContactGroupHandler = HttpResponseResolver<
	never,
	{ Body: { ModifyContactRequest: ModifyContactRequest } },
	SoapResponse<ModifyContactResponse>
>;
export const registerModifyContactGroupHandler = (
	cnItem: CnItem = createSoapContactGroup(),
	error: string | undefined = undefined
): Mock<ModifyContactGroupHandler> => {
	const handler = vi.fn<ModifyContactGroupHandler>(() => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}
		return HttpResponse.json(
			buildSoapResponse<ModifyContactResponse>({
				ModifyContactResponse: {
					cn: [cnItem],
					_jsns: JSNS.MAIL
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
