/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../constants/api';

export interface GetDistributionListRequest extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	needOwners?: number;
}

export interface GetDistributionListResponse extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: Array<{
		name: string;
		isOwner?: boolean;
		owners?: Array<{ owner: Array<{ id?: string; name?: string }> }>;
		_attrs?: {
			displayName?: string;
		};
	}>;
}

export const getDistributionList = (email: string): Promise<GetDistributionListResponse> =>
	soapFetch<GetDistributionListRequest, GetDistributionListResponse | ErrorSoapBodyResponse>(
		'GetDistributionList',
		{
			_jsns: NAMESPACES.account,
			dl: {
				by: 'name',
				_content: email
			}
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
