/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import {
	ErrorSoapResponse,
	SoapFault,
	SoapResponse,
	SuccessSoapResponse
} from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import { mockedAccount } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { NAMESPACES } from '../constants/api';
import { FullAutocompleteResponse, Match } from '../legacy/types/contact';
import {
	BatchDistributionListActionRequest,
	BatchDistributionListActionResponse,
	DistributionListActionResponse
} from '../network/api/distribution-list-action';
import {
	FindContactGroupsRequest,
	FindContactGroupsResponse
} from '../network/api/find-contact-groups';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../network/api/get-distribution-list';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse
} from '../network/api/get-distribution-list-members';

export const buildSoapResponse = <T>(responseData: Record<string, T>): SuccessSoapResponse<T> => ({
	Header: {
		context: {}
	},
	Body: responseData
});

type GetDistributionListMembersHandler = ResponseResolver<
	RestRequest<{ Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest } }>,
	RestContext,
	SoapResponse<GetDistributionListMembersResponse>
>;

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

		const reqBody = await req.json<{
			Body: { GetDistributionListMembersRequest: GetDistributionListMembersRequest };
		}>();
		const { limit } = reqBody.Body.GetDistributionListMembersRequest;

		return res(
			ctx.json(
				buildSoapResponse<GetDistributionListMembersResponse>({
					GetDistributionListMembersResponse: {
						dlm: members?.slice(0, limit).map((member) => ({ _content: member })),
						more: more ?? false,
						total: members?.length,
						_jsns: NAMESPACES.account
					}
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

export const createFindContactGroupsResponse = (
	cn: FindContactGroupsResponse['cn'],
	more = false
): FindContactGroupsResponse => ({
	sortBy: 'nameAsc',
	offset: 0,
	cn,
	more,
	_jsns: 'urn:zimbraMail'
});

export const createFindContactGroupsResponseCnItem = (
	contactGroupName = faker.company.name(),
	members: string[] = [],
	id = faker.number.int({ min: 100 }).toString()
): Required<FindContactGroupsResponse>['cn'][number] => {
	const mappedMembers = members.map((member) => ({ type: 'I' as const, value: member }));

	return {
		id,
		l: '7',
		d: faker.date.recent().valueOf(),
		rev: 12974,
		fileAsStr: contactGroupName,
		_attrs: {
			nickname: contactGroupName,
			fullName: contactGroupName,
			type: 'group',
			fileAs: `8:${contactGroupName}`
		},
		m: mappedMembers,
		sf: 'bo0000000276'
	};
};

type FindContactGroupsHandler = ResponseResolver<
	RestRequest<{ Body: { SearchRequest: FindContactGroupsRequest } }>,
	RestContext,
	SoapResponse<FindContactGroupsResponse>
>;
export const registerFindContactGroupsHandler = (
	...args: Array<{
		offset: number;
		findContactGroupsResponse: FindContactGroupsResponse;
	}>
): jest.Mock<ReturnType<FindContactGroupsHandler>, Parameters<FindContactGroupsHandler>> => {
	const handler = jest.fn<
		ReturnType<FindContactGroupsHandler>,
		Parameters<FindContactGroupsHandler>
	>(async (req, res, ctx) => {
		const reqBody = await req.json<{
			Body: { SearchRequest: FindContactGroupsRequest };
		}>();
		const { offset } = reqBody.Body.SearchRequest;

		const match = args.find((value) => value.offset === offset);

		return res(
			ctx.json(
				buildSoapResponse<FindContactGroupsResponse>({
					SearchResponse:
						match?.findContactGroupsResponse ??
						createFindContactGroupsResponse([createFindContactGroupsResponseCnItem()])
				})
			)
		);
	});
	getSetupServer().use(
		rest.post<
			{ Body: { SearchRequest: FindContactGroupsRequest } },
			never,
			SoapResponse<FindContactGroupsResponse>
		>('/service/soap/SearchRequest', handler)
	);

	return handler;
};

const createAutocompleteResponse = (match: Array<Match>): string => {
	const matchString = match.map((item) => {
		const full = item.full ?? [item.first ?? '', item.last ?? ''].join(' ');
		const filledMatch: Record<keyof Match, string> = {
			first: item.first ?? '',
			last: item.last ?? '',
			full,
			email: `&quot;${full}&quot; &lt;${item.email ?? ''}&gt;`,
			isGroup: item.isGroup ? '1' : '0',
			type: item.type ?? '',
			fileas: item.fileas ?? `8:${full}`,
			ranking: item.ranking ?? ''
		};
		return `<match last="${filledMatch.last}" fileas="${filledMatch.fileas}" ranking="${filledMatch.ranking}" type="${filledMatch.type}" isGroup="${filledMatch.isGroup}" email="${filledMatch.email}" first="${filledMatch.first}" full="${full}" />`;
	});

	return `<FullAutocompleteResponse canBeCached='0' xmlns='${NAMESPACES.mail}'>
		${matchString}
		</FullAutocompleteResponse>`;
};

type FullAutoCompleteHandler = ResponseResolver<
	RestRequest<{ Body: { FullAutocompleteRequest: FullAutocompleteResponse } }>,
	RestContext,
	SoapResponse<string>
>;
export const registerFullAutocompleteHandler = (
	results: Array<Match>
): jest.Mock<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>> => {
	const handler = jest.fn<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>>(
		(req, res, ctx) =>
			res(
				ctx.json(
					buildSoapResponse<string>({
						FullAutocompleteResponse: createAutocompleteResponse(results)
					})
				)
			)
	);
	getSetupServer().use(rest.post('/service/soap/FullAutocompleteRequest', handler));

	return handler;
};
