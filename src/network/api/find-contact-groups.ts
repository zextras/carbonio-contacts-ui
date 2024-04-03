/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CnItem, GenericSoapPayload } from './types';
import { FIND_CONTACT_GROUP_LIMIT } from '../../constants';
import { NAMESPACES } from '../../constants/api';
import { ContactGroup } from '../../model/contact-group';

export interface FindContactGroupsRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	limit: number;
	offset: number;
	sortBy: string;
	types: string;
	query: string;
}

export interface FindContactGroupsResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	cn?: Array<CnItem>;
	sortBy: string;
	offset: number;
	more: boolean;
}

export const findContactGroups = (
	offset = 0
): Promise<{ contactGroups: Array<ContactGroup>; hasMore: boolean }> =>
	fetch(`/service/soap/SearchRequest`, {
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
					query: '#type:group in:contacts'
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		})
		.then((res: { Body: { SearchResponse: FindContactGroupsResponse } }) => {
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
