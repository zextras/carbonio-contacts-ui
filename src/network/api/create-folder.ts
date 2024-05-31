/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, FolderView, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { SoapFolder } from '../../carbonio-ui-commons/types/folder';
import { NAMESPACES } from '../../constants/api';

export interface CreateFolderRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	folder: {
		view: FolderView;
		l: string;
		name: string;
	};
}

export interface CreateFolderResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	folder: SoapFolder;
}

export type CreateFolderParams = {
	parentFolderId: string;
	name: string;
};

export const createFolder = (params: CreateFolderParams): Promise<void> => {
	const request: CreateFolderRequest = {
		folder: {
			view: FOLDER_VIEW.contact,
			l: params.parentFolderId,
			name: params.name
		},
		_jsns: NAMESPACES.mail
	};
	return soapFetch<CreateFolderRequest, CreateFolderResponse | ErrorSoapBodyResponse>(
		'CreateFolder',
		request
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
	});
};
