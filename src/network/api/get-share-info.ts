/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, isEqual, map, uniqWith } from 'lodash';

import { GenericSoapPayload } from './types';
import { FolderView } from '../../carbonio-ui-commons/types/folder';
import { NAMESPACES } from '../../constants/api';
import { ShareInfo } from '../../model/share-info';

export interface GetShareInfoRequest extends GenericSoapPayload<typeof NAMESPACES.account> {
	includeSelf?: 0 | 1;
}

export interface GetShareInfoResponse extends GenericSoapPayload<typeof NAMESPACES.account> {
	share: Array<{
		folderId: string;
		folderPath: string;
		folderUuid: string;
		granteeType: string;
		ownerEmail: string;
		ownerId: string;
		ownerName?: string;
		rights: string;
		view: FolderView;
	}>;
}

const normalizeResponse = (
	response: GetShareInfoResponse | undefined
): Array<ShareInfo> | undefined => {
	if (response?.share === undefined || response.share.length === 0) {
		return undefined;
	}

	// Filter shares that don't belong to Contacts
	const shares = uniqWith(filter(response.share, ['view', 'contact']), isEqual);

	// Normalize the shares
	return map(
		shares,
		(share): ShareInfo => ({
			folderId: `${share.folderId}`, // Temporary workaround for IRIS-5125
			folderPath: share.folderPath,
			folderUuid: share.folderUuid,
			granteeType: share.granteeType,
			ownerEmail: share.ownerEmail,
			ownerId: share.ownerId,
			ownerName: share.ownerName ?? share.ownerEmail,
			rights: share.rights
		})
	);
};

export const getShareInfo = (): Promise<Array<ShareInfo> | undefined> =>
	soapFetch<GetShareInfoRequest, GetShareInfoResponse | ErrorSoapBodyResponse>('GetShareInfo', {
		includeSelf: 0,
		_jsns: NAMESPACES.account
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return normalizeResponse(response);
	});
