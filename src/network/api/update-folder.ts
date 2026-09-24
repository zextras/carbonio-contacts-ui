/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-ui-commons';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { isArray } from 'lodash';

import {
	buildFolderActionRequest,
	folderAction,
	FolderActionRequest,
	FolderActionResponse
} from 'network/api/folder-action';
import { GenericSoapPayload } from 'network/api/types';
import { SoapFault } from 'types/utils';

export type UpdateFolderParams = {
	folderId: string;
	name?: string;
	parentId?: string;
	color?: number;
	rgb?: string;
};

export interface BatchUpdateFolderRequest extends GenericSoapPayload<typeof JSNS.ALL> {
	onerror: 'continue';
	FolderActionRequest: Array<FolderActionRequest>;
}

export type BatchUpdateFolderResponse = GenericSoapPayload<typeof JSNS.ALL> & {
	FolderActionResponse?: Array<FolderActionResponse>;
	Fault?: SoapFault | Array<SoapFault>;
};

export const updateFolder = ({
	folderId,
	name,
	parentId,
	color,
	rgb
}: UpdateFolderParams): Promise<void> => {
	const updateParams = { folderId, name, parentId, color, operation: 'update' as const };
	if (rgb === undefined) {
		return folderAction(updateParams);
	}

	// The server ignores `rgb` on any operation but `color`, so a custom color is sent as a separate
	// `color` action, batched with the update in a single request.
	return legacySoapFetch<BatchUpdateFolderRequest, BatchUpdateFolderResponse>('Batch', {
		onerror: 'continue',
		FolderActionRequest: [
			buildFolderActionRequest(updateParams),
			buildFolderActionRequest({ folderId, rgb, operation: 'color' })
		],
		_jsns: JSNS.ALL
	}).then((response) => {
		if (response.Fault) {
			const faults = isArray(response.Fault) ? response.Fault : [response.Fault];
			throw new Error(faults.map((fault) => fault.Reason.Text).join(',\n'), {
				cause: response.Fault
			});
		}
	});
};
