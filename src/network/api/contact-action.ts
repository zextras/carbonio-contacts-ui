/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export const CONTACT_ACTION_OPERATION = {
	move: 'move',
	delete: 'delete',
	flag: 'flag',
	trash: 'trash',
	tag: 'tag',
	update: 'update'
} as const;

type ContactActionOperation =
	(typeof CONTACT_ACTION_OPERATION)[keyof typeof CONTACT_ACTION_OPERATION];

export interface ContactActionRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		op: ContactActionOperation;
		id: string;
		l?: string;
	};
}

export interface ContactActionResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		op: ContactActionOperation;
		id: string;
		l?: string;
	};
}

export type ContactActionParams = {
	contactsIds: Array<string>;
	operation: ContactActionOperation;
	folderId?: string;
};

export const contactAction = ({
	contactsIds,
	operation,
	folderId
}: ContactActionParams): Promise<ContactActionResponse> => {
	const actionRequests: ContactActionRequest = {
		action: {
			op: operation,
			id: contactsIds.join(','),
			...(folderId !== undefined && { l: folderId })
		},
		_jsns: NAMESPACES.mail
	};

	return soapFetch<ContactActionRequest, ContactActionResponse | ErrorSoapBodyResponse>(
		'ContactAction',
		actionRequests
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
};
