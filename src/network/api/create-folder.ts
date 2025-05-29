/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';
import { FOLDER_VIEW, FolderView, SoapFolder } from '@zextras/carbonio-ui-commons';

import { GenericSoapPayload } from './types';

export interface CreateFolderRequest extends GenericSoapPayload<typeof JSNS.mail> {
	folder: {
		view: FolderView;
		l: string;
		name: string;
	};
}

export type CreateFolderResponse = GenericSoapPayload<typeof JSNS.mail> & {
	folder: SoapFolder;
};

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
		_jsns: JSNS.mail
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
