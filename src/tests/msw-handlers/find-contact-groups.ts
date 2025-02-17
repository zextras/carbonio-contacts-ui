/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS, SoapResponse } from '@zextras/carbonio-shell-ui';
import { http, HttpResponse, HttpResponseResolver } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { CnItem, GenericSoapPayload } from '../../network/api/types';
import { buildSoapResponse, createCnItem } from '../utils';

interface FindContactGroupsSoapApiRequest extends GenericSoapPayload<typeof JSNS.mail> {
	limit: number;
	offset: number;
	sortBy: string;
	types: string;
	query: string;
}

interface FindContactGroupsSoapApiResponse extends GenericSoapPayload<typeof JSNS.mail> {
	cn?: Array<CnItem>;
	sortBy: string;
	offset: number;
	more: boolean;
}
export const createFindContactGroupsResponse = (
	cn: FindContactGroupsSoapApiResponse['cn'],
	more = false
): FindContactGroupsSoapApiResponse => ({
	sortBy: 'nameAsc',
	offset: 0,
	cn,
	more,
	_jsns: 'urn:zimbraMail'
});
type FindContactGroupsHandler = HttpResponseResolver<
	never,
	{ Body: { SearchRequest: FindContactGroupsSoapApiRequest } },
	SoapResponse<FindContactGroupsSoapApiResponse>
>;
export const registerFindContactGroupsHandler = (
	...args: Array<{
		offset: number;
		findContactGroupsResponse: FindContactGroupsSoapApiResponse;
	}>
): jest.Mock<ReturnType<FindContactGroupsHandler>, Parameters<FindContactGroupsHandler>> => {
	const handler = jest.fn<
		ReturnType<FindContactGroupsHandler>,
		Parameters<FindContactGroupsHandler>
	>(async ({ request }) => {
		const reqBody = await request.json();
		const { offset } = reqBody.Body.SearchRequest;

		const match = args.find((value) => value.offset === offset);

		return HttpResponse.json(
			buildSoapResponse<FindContactGroupsSoapApiResponse>({
				SearchResponse:
					match?.findContactGroupsResponse ?? createFindContactGroupsResponse([createCnItem()])
			})
		);
	});
	getSetupServer().use(
		http.post<
			never,
			{ Body: { SearchRequest: FindContactGroupsSoapApiRequest } },
			SoapResponse<FindContactGroupsSoapApiResponse>
		>('/service/soap/SearchRequest', handler)
	);

	return handler;
};
