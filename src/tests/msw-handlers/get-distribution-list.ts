/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetDistributionListHandler = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListRequest: GetDistributionListRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListResponse>
>;

export const buildGetDistributionListResponse = (
	dl: DistributionList
): GetDistributionListResponse => ({
	dl: [
		{
			id: dl.id,
			name: dl.email,
			_attrs: {
				displayName: dl.displayName,
				description: dl.description,
				zimbraHideInGal: dl.canRequireMembers ? undefined : 'TRUE'
			},
			owners: map(dl.owners, (owner) => ({ owner: [owner] })),
			isOwner: dl.isOwner,
			isMember: dl.isMember
		}
	],
	_jsns: NAMESPACES.account
});

export const registerGetDistributionListHandler = (
	dl: DistributionList,
	error?: string
): jest.Mock<ReturnType<GetDistributionListHandler>, Parameters<GetDistributionListHandler>> => {
	const handler = jest.fn<
		ReturnType<GetDistributionListHandler>,
		Parameters<GetDistributionListHandler>
	>((req, res, ctx) => {
		if (error) {
			return res(ctx.json(buildSoapError(error)));
		}

		return res(
			ctx.json(
				buildSoapResponse<GetDistributionListResponse>({
					GetDistributionListResponse: buildGetDistributionListResponse(dl)
				})
			)
		);
	});
	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListRequest: GetDistributionListRequest } },
			never,
			SoapResponse<GetDistributionListResponse>
		>('/service/soap/GetDistributionListRequest', handler)
	);

	return handler;
};
