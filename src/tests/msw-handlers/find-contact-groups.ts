/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import {
	FindContactGroupsRequest,
	FindContactGroupsResponse
} from '../../network/api/find-contact-groups';
import { buildSoapResponse } from '../utils';

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
