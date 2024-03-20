/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { http, HttpResponse, HttpResponseResolver } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetDistributionListHandler = HttpResponseResolver<
	never,
	{ Body: { GetDistributionListRequest: GetDistributionListRequest } },
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
	>(() => {
		if (error) {
			return HttpResponse.json(buildSoapError(error));
		}

		return HttpResponse.json(
			buildSoapResponse<GetDistributionListResponse>({
				GetDistributionListResponse: buildGetDistributionListResponse(dl)
			})
		);
	});
	getSetupServer().use(
		http.post<
			never,
			{ Body: { GetDistributionListRequest: GetDistributionListRequest } },
			SoapResponse<GetDistributionListResponse>
		>('/service/soap/GetDistributionListRequest', handler)
	);

	return handler;
};
