/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';

import { CnItem, GenericSoapPayload } from './types';
import { ContactGroup } from '../../model/contact-group';

export type ModifyContactAttribute = { n: 'fullName' | 'nickname' | 'fileAs'; _content: string };

export interface ModifyContactRequest extends GenericSoapPayload<typeof JSNS.mail> {
	cn: {
		id: string;
		m?: Array<{ type: 'I'; value: string; op: '+' | '-' }>;
		a?: Array<ModifyContactAttribute>;
	};
}

export type ModifyContactResponse = GenericSoapPayload<typeof JSNS.mail> & {
	cn: Array<CnItem>;
};

export const modifyContact = ({
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
		_jsns: JSNS.mail
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

export const modifyContactGroup = ({
	id,
	addedMembers,
	removedMembers,
	name
}: {
	id: string;
	addedMembers?: string[];
	removedMembers?: string[];
	name?: string;
}): Promise<ContactGroup> => {
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
			title: res.cn[0]._attrs.fullName ?? '',
			members: res.cn[0].m?.map((value) => value.value) ?? []
		})
	);
};
