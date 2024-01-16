/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export const CONTACT_ACTION_OPERATION = {
	delete: 'delete',
	rename: 'rename',
	modify: 'modify',
	addOwners: 'addOwners',
	removeOwners: 'removeOwners',
	setOwners: 'setOwners',
	grantRights: 'grantRights',
	revokeRights: 'revokeRights',
	setRights: 'setRights',
	addMembers: 'addMembers',
	removeMembers: 'removeMembers',
	acceptSubsReq: 'acceptSubsReq',
	rejectSubsReq: 'rejectSubsReq',
	resetimapuid: 'resetimapuid'
} as const;

type ContactActionOperation =
	(typeof CONTACT_ACTION_OPERATION)[keyof typeof CONTACT_ACTION_OPERATION];

export interface ContactActionRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		op: ContactActionOperation;
		id: string;
	};
}

export interface ContactActionResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		op: ContactActionOperation;
		id: string;
	};
}

export const contactAction = (
	operation: ContactActionOperation,
	ids: string[]
): Promise<ContactActionResponse> => {
	const actionRequests: ContactActionRequest = {
		action: { op: operation, id: ids.join(',') },
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

export function deleteContactAction(ids: string[]): Promise<ContactActionResponse> {
	return contactAction(CONTACT_ACTION_OPERATION.delete, ids);
}
