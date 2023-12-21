/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../constants/api';

export interface GetDistributionListMembersRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	limit?: number;
}

export interface GetDistributionListMembersResponse
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dlm?: Array<{ _content: string }>;
	more: boolean;
	total: number;
}

export const getDistributionListMembers = (
	email: string
): Promise<GetDistributionListMembersResponse> =>
	soapFetch<
		GetDistributionListMembersRequest,
		GetDistributionListMembersResponse | ErrorSoapBodyResponse
	>('GetDistributionListMembers', {
		_jsns: NAMESPACES.account,
		dl: {
			by: 'name',
			_content: email
		}
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}

		// TODO use an model type
		// TODO set a default empty array if there is no members
		return response;
	});
