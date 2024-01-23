/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export type ModifyContactAttribute = { n: 'fullName' | 'nickname' | 'fileAs'; _content: string };

export interface ModifyContactRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	cn: {
		id: string;
		m?: Array<{ type: 'I'; value: string; op: '+' | '-' }>;
		a?: Array<ModifyContactAttribute>;
	};
}

export interface ModifyContactResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	cn: Array<{
		id: string;
		l: string;
		d: number;
		rev: number;
		fileAsStr: string;
		_attrs: { fullName?: string; nickname?: string; type: string; fileAs: string };
		m: Array<{ type: 'I'; value: string }>;
	}>;
}

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
		_jsns: NAMESPACES.mail
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
}): Promise<ModifyContactResponse> => {
	const attributes: Array<ModifyContactAttribute> | undefined = name
		? [
				{ n: 'fullName', _content: name },
				{ n: 'fileAs', _content: `8:${name}` },
				{ n: 'nickname', _content: name }
		  ]
		: undefined;
	return modifyContact({ id, addedMembers, removedMembers, attributes });
};
