/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapResponse, SoapResponse } from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { mockedAccount } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { NAMESPACES } from '../../constants/api';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../network/api/get-distribution-list';
import { buildSoapResponse } from '../utils';

type GetDistributionList = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListRequest: GetDistributionListRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListResponse>
>;
export const registerGetDistributionListHandler = (
	dl: { email: string; displayName?: string; owners?: Array<{ id?: string; name?: string }> },
	error?: string
): jest.Mock<ReturnType<GetDistributionList>, Parameters<GetDistributionList>> => {
	const handler = jest.fn<ReturnType<GetDistributionList>, Parameters<GetDistributionList>>(
		(req, res, ctx) => {
			if (error) {
				return res(
					ctx.json<ErrorSoapResponse>({
						Header: {
							context: {}
						},
						Body: {
							Fault: {
								Reason: { Text: error },
								Detail: {
									Error: { Code: '', Detail: error }
								}
							}
						}
					})
				);
			}

			return res(
				ctx.json(
					buildSoapResponse<GetDistributionListResponse>({
						GetDistributionListResponse: {
							dl: [
								{
									name: dl.email,
									_attrs: {
										displayName: dl.displayName
									},
									owners: map(dl.owners, (owner) => ({ owner: [owner] })),
									isOwner: some(dl.owners, (owner) => owner.id === mockedAccount.id)
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
