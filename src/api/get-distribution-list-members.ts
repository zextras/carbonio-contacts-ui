/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, NameSpace, soapFetch } from '@zextras/carbonio-shell-ui';
import { NAMESPACES } from '../constants/api';
import { GenericSoapPayload } from './types';

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
	dlm: Array<{ _content: string }>;
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
		return response;
	});
