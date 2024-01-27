/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { BooleanString, SoapResponse } from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { NAMESPACES } from '../../constants/api';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { buildSoapError, buildSoapResponse } from '../utils';

type GetDistributionList = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListRequest: GetDistributionListRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListResponse>
>;
export const registerGetDistributionListHandler = (
	data: {
		id?: string;
		email: string;
		displayName?: string;
		owners?: Array<{ id?: string; name?: string }>;
		description?: string;
		isOwner?: boolean;
		zimbraHideParam?: BooleanString;
	},
	error?: string
): jest.Mock<ReturnType<GetDistributionList>, Parameters<GetDistributionList>> => {
	const handler = jest.fn<ReturnType<GetDistributionList>, Parameters<GetDistributionList>>(
		(req, res, ctx) => {
			if (error) {
				return res(ctx.json(buildSoapError(error)));
			}

			return res(
				ctx.json(
					buildSoapResponse<GetDistributionListResponse>({
						GetDistributionListResponse: {
							dl: [
								{
									id: data.id ?? faker.string.uuid(),
									name: data.email,
									_attrs: {
										displayName: data.displayName,
										description: data.description,
										zimbraHideInGal: data.zimbraHideParam
									},
									owners: map(data.owners, (owner) => ({ owner: [owner] })),
									isOwner:
										some(data.owners, (owner) => owner.id === mockedAccount.id) || data.isOwner
								}
							],
							_jsns: NAMESPACES.account
						}
					})
				)
			);
		}
	);
	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListRequest: GetDistributionListRequest } },
			never,
			SoapResponse<GetDistributionListResponse>
		>('/service/soap/GetDistributionListRequest', handler)
	);

	return handler;
};
