/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { CnItem, GenericSoapPayload } from './types';
import { ContactGroup } from '../../model/contact-group';

export type ModifyContactAttribute = { n: 'fullName' | 'nickname' | 'fileAs'; _content: string };

export interface ModifyContactRequest extends GenericSoapPayload<typeof JSNS.MAIL> {
	cn: {
		id: string;
		m?: Array<{ type: 'I'; value: string; op: '+' | '-' }>;
		a?: Array<ModifyContactAttribute>;
	};
}

export type ModifyContactResponse = GenericSoapPayload<typeof JSNS.MAIL> & {
	cn: Array<CnItem>;
};

const modifyContact = ({
	id,
	addedMembers,
	removedMembers,
	attributes
}: {
	id: string;
	addedMembers?: string[];
	removedMembers?: string[];
	attributes?: Array<ModifyContactAttribute>;
}): Promise<ModifyContactResponse> => {
	const modifyContactRequest: ModifyContactRequest = {
		cn: {
			id,
			m:
				addedMembers || removedMembers
					? (addedMembers ?? [])
							.map<{ type: 'I'; value: string; op: '+' | '-' }>((m) => ({
								type: 'I',
								op: '+',
								value: m
							}))
							.concat((removedMembers ?? []).map((m) => ({ type: 'I', op: '-', value: m })))
					: undefined,
			a: attributes
		},
		_jsns: JSNS.MAIL
	};

	return soapFetch<ModifyContactRequest, ModifyContactResponse | ErrorSoapBodyResponse>(
		'ModifyContact',
		modifyContactRequest
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
};

type ModifyContactGroupRequest = {
	id: string;
	addedMembers?: string[];
	removedMembers?: string[];
	name?: string;
};

export const modifyContactGroup = async ({
	id,
	addedMembers,
	removedMembers,
	name
}: ModifyContactGroupRequest): Promise<ContactGroup> => {
	const attributes: Array<ModifyContactAttribute> | undefined = name
		? [
				{ n: 'fullName', _content: name },
				{ n: 'fileAs', _content: `8:${name}` },
				{ n: 'nickname', _content: name }
			]
		: undefined;
	return modifyContact({ id, addedMembers, removedMembers, attributes }).then(
		(res: ModifyContactResponse) => ({
			id: res.cn[0].id,
			parent: res.cn[0].l,
			title: res.cn[0]._attrs.fullName ?? '',
			members: res.cn[0].m?.map((value) => value.value) ?? []
		})
	);
};
