/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault, soapFetch } from '@zextras/carbonio-shell-ui';
import { isArray } from 'lodash';

import { FolderActionRequest, FolderActionResponse } from './folder-action';
import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export interface BatchShareFolderRequest extends GenericSoapPayload<typeof NAMESPACES.generic> {
	FolderActionRequest: Array<FolderActionRequest>;
}

export interface BatchShareFolderResponse extends GenericSoapPayload<typeof NAMESPACES.generic> {
	FolderActionResponse?: Array<FolderActionResponse>;
	Fault?: SoapFault | Array<SoapFault>;
}

export type ShareFolderParams = {
	addresses: Array<string>;
	role: string;
	folderId: string;
};

export const shareFolder = ({ addresses, folderId, role }: ShareFolderParams): Promise<void> => {
	const actionRequests: Array<FolderActionRequest> = addresses.map((address, key) => ({
		action: {
			id: folderId,
			op: 'grant',
			grant: {
				gt: 'usr',
				d: address,
				perm: role
			}
		},
		_jsns: NAMESPACES.mail
	}));

	return soapFetch<BatchShareFolderRequest, BatchShareFolderResponse>('Batch', {
		FolderActionRequest: actionRequests,
		_jsns: NAMESPACES.generic
	}).then((response) => {
		if ('Fault' in response) {
			if (isArray(response.Fault)) {
				throw new Error(response.Fault?.map((fault) => fault.Reason.Text).join(',\n'), {
					cause: response.Fault
				});
			}

			throw new Error(response.Fault?.Reason.Text, {
				cause: response.Fault
			});
		}
	});
};
