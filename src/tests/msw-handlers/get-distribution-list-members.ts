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
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../../network/api/get-distribution-list-members';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetDistributionListMembersHandler = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListMembersResponse>
>;

export const buildGetDistributionListMembersResponse = (
	members: Array<string> | undefined,
	limit?: number,
	more?: boolean
): GetDistributionListMembersResponse => ({
	dlm: members?.slice(0, limit).map((member) => ({ _content: member })),
	more: more ?? false,
	total: members?.length,
	_jsns: NAMESPACES.account
});
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
	>(async (req, res, ctx) => {
		if (error) {
			return res(ctx.json(buildSoapError(error)));
		}

		const reqBody = await req.json<{
			Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
		}>();
		const { limit } = reqBody.Body.GetDistributionListMembersRequest;

		return res(
			ctx.json(
				buildSoapResponse<GetDistributionListMembersResponse>({
					GetDistributionListMembersResponse: buildGetDistributionListMembersResponse(
						members,
						limit,
						more
					)
				})
			)
		);
	});

	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
			never,
			SoapResponse<GetDistributionListMembersResponse>
		>('/service/soap/GetDistributionListMembersRequest', handler)
	);

	return handler;
};
