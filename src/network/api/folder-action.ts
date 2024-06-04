/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export type FolderActionOperation =
	| 'read'
	| 'delete'
	| 'rename'
	| 'move'
	| 'trash'
	| 'empty'
	| 'color'
	| 'grant'
	| '!grant'
	| 'revokeorphangrants'
	| 'url'
	| 'import'
	| 'sync'
	| 'fb'
	| 'check'
	| '!check'
	| 'update'
	| 'syncon'
	| '!syncon'
	| 'retentionpolicy'
	| 'disableactivesync'
	| '!disableactivesync'
	| 'webofflinesyncdays';

export interface FolderActionRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		id: string;
		op: FolderActionOperation;
		name?: string;
		l?: string;
		recursive?: boolean;
		color?: number;
		zid?: string;
	};
}

export interface FolderActionResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	action: {
		zid?: string; // Grantee ID
		d?: string; // Display name
		key?: string; // Access key (Password)
		id: string; // Comma-separated list of ids which have been successfully processed
		op: FolderActionOperation; // Operation
		nei?: string; // Comma-separated list of non-existent ids (if requested)
		nci?: string; // Comma-separated list of newly created ids (if requested)
	};
}

export type FolderActionParams = {
	folderId: string;
	operation: FolderActionOperation;
	recursive?: boolean;
	parentId?: string;
	granteeId?: string;
	name?: string;
	color?: number;
};

/**
 * Call the API to perform actions on a folder/tag.
 * It returns nothing because, at the moment, the generated items will be
 * fetched by the folders synchronization
 *
 * @param params
 */
export const folderAction = (params: FolderActionParams): Promise<void> => {
	const request: FolderActionRequest = {
		action: {
			id: params.folderId,
			op: params.operation,
			...(params.parentId !== undefined && { l: params.parentId }),
			...(params.recursive !== undefined && { recursive: params.recursive }),
			...(params.name !== undefined && { name: params.name }),
			...(params.color !== undefined && { color: params.color }),
			...(params.granteeId !== undefined && { zid: params.granteeId })
		},
		_jsns: NAMESPACES.mail
	};
	return soapFetch<FolderActionRequest, FolderActionResponse | ErrorSoapBodyResponse>(
		'FolderAction',
		request
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
	});
};
