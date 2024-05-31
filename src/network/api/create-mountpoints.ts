/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, FOLDERS, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { SoapLink } from '../../carbonio-ui-commons/types/folder';
import { NAMESPACES } from '../../constants/api';
import { ShareInfo } from '../../model/share-info';

export interface CreateMountpointsRequest extends GenericSoapPayload<typeof NAMESPACES.generic> {
	CreateMountpointRequest: Array<{
		link: {
			l: string;
			name: string;
			rid: string;
			view: 'contact';
			zid: string;
		};
		_jsns: typeof NAMESPACES.mail;
	}>;
}

export interface CreateMountpointsResponse extends GenericSoapPayload<typeof NAMESPACES.generic> {
	CreateMountpointResponse: Array<{ link: Array<SoapLink & { _jsns: typeof NAMESPACES.mail }> }>;
}

/**
 * Call the API to create mountpoints for the given shares.
 * It returns nothing because, at the moment, the generated links will be
 * fetched by the folders synchronization
 *
 * @param shares
 */
export const createMountpoints = (
	shares: Array<ShareInfo & { mountpointName: string }>
): Promise<void> =>
	soapFetch<CreateMountpointsRequest, CreateMountpointsResponse | ErrorSoapBodyResponse>('Batch', {
		CreateMountpointRequest: map(shares, (share) => ({
			link: {
				l: FOLDERS.USER_ROOT,
				name: share.mountpointName,
				rid: share.folderId,
				view: 'contact',
				zid: share.ownerId
			},
			_jsns: NAMESPACES.mail
		})),
		_jsns: NAMESPACES.generic
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
	});
