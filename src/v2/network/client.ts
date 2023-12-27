/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FIND_CONTACT_GROUP_LIMIT } from '../constants';
import { ContactGroup } from '../types/utils';

export const client = {
	createContactGroup: (title: string, members: Array<string>): Promise<any> =>
		fetch(`/service/soap/CreateContactRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					[`CreateContactRequest`]: {
						_jsns: 'urn:zimbraMail',
						cn: {
							a: [
								{ n: 'fullName', _content: title },
								{ n: 'nickname', _content: title },
								{ n: 'type', _content: 'group' },
								{ n: 'fileAs', _content: `8:${title}` }
							],
							m: members.map((member) => ({ type: 'I', value: member }))
						}
					}
				},
				Header: {
					context: {
						_jsns: 'urn:zimbra'
					}
				}
			})
		}).then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		}),
	findContactGroups: (
		offset = 0
	): Promise<{ contactGroups: Array<ContactGroup>; hasMore: boolean }> =>
		fetch(`/service/soap/SearchRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					[`SearchRequest`]: {
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
			.then((res) => {
				let contactGroups = [];
				if (res.Body.SearchResponse.cn) {
					contactGroups = res.Body.SearchResponse.cn.map((value: any) => ({
						id: value.id,
						title: value._attrs.fullName ?? '',
						members:
							value.m
								?.filter((value: any) => value.type === 'I')
								.map((value: any) => value.value) ?? []
					}));
				}
				return { contactGroups, hasMore: res.Body.SearchResponse.more };
			})
};
