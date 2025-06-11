/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ContactGroup } from 'model/contact-group';
import { CnItem } from 'network/api/types';

type ResponseJSON = { Body: { CreateContactResponse: { cn: Array<CnItem> } } };
type ModifyContactRequest = {
	title: string;
	members: Array<string>;
	folderId: string;
};

export const createContactGroup = async ({
	title,
	members,
	folderId
}: ModifyContactRequest): Promise<ContactGroup> => {
	const response = await fetch(`/service/soap/CreateContactRequest`, {
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
						m: members.map((member) => ({ type: 'I', value: member })),
						l: folderId
					}
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	});
	if (!response.ok) {
		throw new Error('Something went wrong');
	}
	const jsonResponse = await response.json();
	const { Body } = jsonResponse as ResponseJSON;
	const cnItem = Body.CreateContactResponse.cn[0];
	return {
		id: cnItem.id,
		parent: cnItem.l,
		title: cnItem._attrs.fullName ?? '',
		members: cnItem.m?.map((value) => value.value) ?? []
	};
};
