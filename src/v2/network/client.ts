/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ContactGroup } from '../types/utils';

export const client = {
	createContactGroup: (title: string, members: Array<string>): Promise<Array<ContactGroup>> =>
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
	findContactGroups: (offset = 0): Promise<any> =>
		fetch(`/service/soap/SearchRequest`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				Body: {
					[`SearchRequest`]: {
						_jsns: 'urn:zimbraMail',
						limit: 100,
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
				if (res.Body.SearchResponse.cn) {
					return res.Body.SearchResponse.cn.map((value: any) => ({
						id: value.id,
						title: value._attrs.fullName ?? '',
						members:
							value.m
								?.filter((value: any) => value.type === 'I')
								.map((value: any) => value.value) ?? []
					}));
				}
				return [];
			})
};
