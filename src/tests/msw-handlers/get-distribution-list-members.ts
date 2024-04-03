/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponse, HttpResponseResolver, http } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../../network/api/get-distribution-list-members';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetDistributionListMembersHandler = HttpResponseResolver<
	never,
	{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
	SoapResponse<GetDistributionListMembersResponse>
>;

export const buildGetDistributionListMembersResponse = (
	members: Array<string> | undefined,
	limit?: number,
	more?: boolean,
	offset = 0
): GetDistributionListMembersResponse => {
	const sliceTo = limit === undefined || limit === 0 ? undefined : offset + limit;
	const dlm = members?.slice(offset, sliceTo).map((member) => ({ _content: member }));
	return {
		dlm,
		more: more ?? false,
		total: members?.length,
		_jsns: NAMESPACES.account
	};
};
export const registerGetDistributionListMembersHandler = (
	members?: Array<string>,
	more?: boolean,
	error?: string
): jest.Mock<
	ReturnType<GetDistributionListMembersHandler>,
	Parameters<GetDistributionListMembersHandler>
> => {
	const handler = jest.fn<
		ReturnType<GetDistributionListMembersHandler>,
		Parameters<GetDistributionListMembersHandler>
	>(async ({ request }) => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}

		const {
			Body: {
				GetDistributionListMembersRequest: { limit, offset }
			}
		} = await request.clone().json();

		return HttpResponse.json(
			buildSoapResponse<GetDistributionListMembersResponse>({
				GetDistributionListMembersResponse: buildGetDistributionListMembersResponse(
					members,
					limit,
					more,
					offset
				)
			})
		);
	});

	getSetupServer().use(
		http.post<
			never,
			{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
			SoapResponse<GetDistributionListMembersResponse>
		>('/service/soap/GetDistributionListMembersRequest', handler)
	);

	return handler;
};
