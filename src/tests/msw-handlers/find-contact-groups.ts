/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import {
	FindContactGroupsRequest,
	FindContactGroupsResponse
} from '../../network/api/find-contact-groups';
import { buildSoapResponse, createCnItem } from '../utils';

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
						match?.findContactGroupsResponse ?? createFindContactGroupsResponse([createCnItem()])
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
