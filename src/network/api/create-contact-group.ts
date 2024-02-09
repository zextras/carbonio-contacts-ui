/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CnItem } from './types';
import { ContactGroup } from '../../model/contact-group';

export const createContactGroup = (title: string, members: Array<string>): Promise<ContactGroup> =>
	fetch(`/service/soap/CreateContactRequest`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				CreateContactRequest: {
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
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		})
		.then(({ Body }: { Body: { CreateContactResponse: { cn: Array<CnItem> } } }) => {
			const cnItem = Body.CreateContactResponse.cn[0];

			return {
				id: cnItem.id,
				title: cnItem._attrs.fullName ?? '',
				members: cnItem.m?.map((value) => value.value) ?? []
			};
		});
