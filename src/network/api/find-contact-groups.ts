/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';

import { CnItem, GenericSoapPayload } from './types';
import { FIND_CONTACT_GROUP_LIMIT } from '../../constants';
import { ContactGroup } from '../../model/contact-group';

export interface FindContactGroupsSoapApiRequest extends GenericSoapPayload<typeof JSNS.mail> {
	limit: number;
	offset: number;
	sortBy: string;
	types: string;
	query: string;
}

export interface FindContactGroupsSoapApiResponse extends GenericSoapPayload<typeof JSNS.mail> {
	cn?: Array<CnItem>;
	sortBy: string;
	offset: number;
	more: boolean;
}

type FindContactGroupsResponse = Promise<{ contactGroups: Array<ContactGroup>; hasMore: boolean }>;

function findContactGroupsSoapApi(offset: number, accountId?: string): Promise<Response> {
	let query = '#type:group';
	if (accountId) {
		query = `${query} inid:${accountId}:7`;
	} else {
		query = `${query} inid:7`;
	}
	return fetch(`/service/soap/SearchRequest`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				SearchRequest: {
					_jsns: 'urn:zimbraMail',
					limit: FIND_CONTACT_GROUP_LIMIT,
					offset,
					sortBy: 'nameAsc',
					types: 'contact',
					query
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	});
}

function handlefindContactGroups(apiResponse: Promise<Response>): FindContactGroupsResponse {
	return apiResponse
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		})
		.then((res: { Body: { SearchResponse: FindContactGroupsSoapApiResponse } }) => {
			const contactGroups = res.Body.SearchResponse.cn
				? res.Body.SearchResponse.cn.map((value) => ({
						id: value.id,
						title: value._attrs.fullName ?? '',
						members:
							value.m?.filter((value) => value.type === 'I').map((value) => value.value) ?? []
					}))
				: [];
			return { contactGroups, hasMore: res.Body.SearchResponse.more };
		});
}

export const findContactGroups = (offset = 0): FindContactGroupsResponse =>
	handlefindContactGroups(findContactGroupsSoapApi(offset));

export const findUserContactGroups = (
	accountId: string,
	offset: number
): FindContactGroupsResponse =>
	handlefindContactGroups(findContactGroupsSoapApi(offset, accountId));
