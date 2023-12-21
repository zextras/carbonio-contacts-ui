/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ErrorSoapResponse,
	SoapFault,
	SoapResponse,
	SuccessSoapResponse
} from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import {
	BatchDistributionListActionRequest,
	BatchDistributionListActionResponse,
	DistributionListActionResponse
} from '../api/distribution-list-action';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../api/get-distribution-list';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../api/get-distribution-list-members';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import { mockedAccount } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { NAMESPACES } from '../constants/api';

const buildSoapResponse = <T>(responseData: Record<string, T>): SuccessSoapResponse<T> => ({
	Header: {
		context: {}
	},
	Body: responseData
});

export const registerGetDistributionListMembersHandler = (
	members?: Array<string>,
	error?: string
): void => {
	getSetupServer().use(
		rest.post<
			{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } },
			never,
			SoapResponse<GetDistributionListMembersResponse>
		>('/service/soap/GetDistributionListMembersRequest', async (req, res, ctx) => {
			const reqBody = await req.json<{
				Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
			}>();
			const { limit } = reqBody.Body.GetDistributionListMembersRequest;
			if (limit !== undefined && limit > 0) {
				throw new Error('expected limit to be undefined or 0 to load all members');
			}
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
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: {
							dlm: members?.map((member) => ({ _content: member })),
							more: false,
							total: members?.length,
							_jsns: NAMESPACES.account
						}
					})
				)
			);
		})
	);
};

type DistributionListActionHandlerResponseResolver = ResponseResolver<
	RestRequest<{ Body: { BatchRequest: BatchDistributionListActionRequest } }, never>,
	RestContext,
	SuccessSoapResponse<BatchDistributionListActionResponse>
>;

export const registerDistributionListActionHandler = (
	membersToAdd: Array<string>,
	membersToRemove: Array<string>,
	errors?: string[]
): jest.Mock<
	ReturnType<DistributionListActionHandlerResponseResolver>,
	Parameters<DistributionListActionHandlerResponseResolver>
> => {
	const handler = jest.fn<
		ReturnType<DistributionListActionHandlerResponseResolver>,
		Parameters<DistributionListActionHandlerResponseResolver>
	>(async (req, res, ctx) => {
		const responses: Array<DistributionListActionResponse> = [];
		if (membersToAdd.length > 0) {
			responses.push({
				_jsns: NAMESPACES.account
			});
		}
		if (membersToRemove.length > 0) {
			responses.push({
				_jsns: NAMESPACES.account
			});
		}

		const actionResponse =
			responses.length > 0 ? { DistributionListActionResponse: responses } : {};

		const fault =
			errors && errors.length > 0
				? {
						Fault: map(
							errors,
							(error): SoapFault => ({
								Reason: { Text: error },
								Detail: { Error: { Detail: error, Code: '' } }
							})
						)
				  }
				: {};

		return res(
			ctx.json(
				buildSoapResponse<BatchDistributionListActionResponse>({
					BatchResponse: {
						_jsns: NAMESPACES.generic,
						...actionResponse,
						...fault
					}
				})
			)
		);
	});
	getSetupServer().use(rest.post('/service/soap/BatchRequest', handler));
	return handler;
};

type GetDistributionListHandler = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListRequest: GetDistributionListRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListResponse>
>;

export const registerGetDistributionListHandler = (
	dl: { email: string; displayName?: string; owners?: Array<{ id?: string; name?: string }> },
	error?: string
): jest.Mock<ReturnType<GetDistributionListHandler>, Parameters<GetDistributionListHandler>> => {
	const handler = jest.fn<
		ReturnType<GetDistributionListHandler>,
		Parameters<GetDistributionListHandler>
	>((req, res, ctx) => {
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
