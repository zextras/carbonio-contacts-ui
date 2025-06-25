/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { FOLDERS, JSNS, SoapLink } from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';

import { GenericSoapPayload } from 'network/api/types';
import { ShareInfo } from 'model/share-info';

export type CreateMountpointsRequest = GenericSoapPayload<typeof JSNS.ALL> & {
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

export type CreateMountpointsResponse = GenericSoapPayload<typeof JSNS.ALL> & {
	CreateMountpointResponse: Array<{ link: Array<SoapLink & { _jsns: typeof JSNS.MAIL }> }>;
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
		_jsns: JSNS.ALL
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
	});
