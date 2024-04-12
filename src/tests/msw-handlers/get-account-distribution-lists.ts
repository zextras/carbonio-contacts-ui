/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { http, HttpResponse, HttpResponseResolver } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';
import type {
	GetAccountDistributionListsRequest,
	GetAccountDistributionListsResponse
} from '../../network/api/get-account-distribution-lists';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetAccountDistributionListsHandler = HttpResponseResolver<
	never,
	{ Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest } },
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
	>(async ({ request }) => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}
		const reqBody = await request.clone().json();
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
		return HttpResponse.json(
			buildSoapResponse<GetAccountDistributionListsResponse>({
				GetAccountDistributionListsResponse: {
					dl: dlArray.length > 0 ? dlArray : undefined,
					_jsns: NAMESPACES.account
				}
			})
		);
	});

	getSetupServer().use(
		http.post<
			never,
			{ Body: { GetAccountDistributionListsRequest: GetAccountDistributionListsRequest } },
			SoapResponse<GetAccountDistributionListsResponse>
		>('/service/soap/GetAccountDistributionListsRequest', handler)
	);

	return handler;
};
