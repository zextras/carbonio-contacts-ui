/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';
import type {
	GetAccountDistributionListsRequest,
	GetAccountDistributionListsResponse
} from '../../network/api/get-account-distribution-lists';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetAccountDistributionListsHandler = ResponseResolver<
	RestRequest<{ Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest } }>,
	RestContext,
	SoapResponse<GetAccountDistributionListsResponse>
>;

export const registerGetAccountDistributionListsHandler = (
	items: Array<DistributionList>,
	error?: string
): jest.Mock<
	ReturnType<GetAccountDistributionListsHandler>,
	Parameters<GetAccountDistributionListsHandler>
> => {
	const handler = jest.fn<
		ReturnType<GetAccountDistributionListsHandler>,
		Parameters<GetAccountDistributionListsHandler>
	>(async (req, res, ctx) => {
		if (error) {
			return res(ctx.json(buildSoapError(error)));
		}
		const reqBody = await req.json<{
			Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest };
		}>();
		const { ownerOf, memberOf, attrs } = reqBody.Body.GetAccountDistributionListsRequest;

		const dlArray = items.reduce<NonNullable<GetAccountDistributionListsResponse['dl']>>(
			(result, item) => {
				result.push({
					id: item.id,
					name: item.email,
					d: item.displayName,
					isOwner: ownerOf === true ? item.isOwner : undefined,
					isMember: memberOf === 'all' || memberOf === 'directOnly' ? item.isMember : undefined,
					_attrs: {
						zimbraHideInGal:
							attrs?.includes('zimbraHideInGal') && !item.canRequireMembers ? 'TRUE' : undefined,
						description: attrs?.includes('description') ? item.description : undefined
					}
				});
				return result;
			},
			[]
		);
		return res(
			ctx.json(
				buildSoapResponse<GetAccountDistributionListsResponse>({
					GetAccountDistributionListsResponse: {
						dl: dlArray.length > 0 ? dlArray : undefined,
						_jsns: NAMESPACES.account
					}
				})
			)
		);
	});

	getSetupServer().use(
		rest.post<
			{ Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest } },
			never,
			SoapResponse<GetAccountDistributionListsResponse>
		>('/service/soap/GetAccountDistributionListsRequest', handler)
	);

	return handler;
};
