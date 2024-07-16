/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { SoapLink } from '../../carbonio-ui-commons/types/folder';
import { ShareInfo } from '../../model/share-info';

export type CreateMountpointsRequest = GenericSoapPayload<typeof JSNS.all> & {
	CreateMountpointRequest: Array<{
		link: {
			l: string;
			name: string;
			rid: string;
			view: 'contact';
			zid: string;
		};
		_jsns: string;
	}>;
};

export type CreateMountpointsResponse = GenericSoapPayload<typeof JSNS.all> & {
	CreateMountpointResponse: Array<{ link: Array<SoapLink & { _jsns: typeof JSNS.mail }> }>;
};

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
			_jsns: 'urn:zimbraMail'
		})),
		_jsns: JSNS.all
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
	});
