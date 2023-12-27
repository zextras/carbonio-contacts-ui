/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../constants/api';
import { DistributionListMembersPage } from '../model/distribution-list';

export interface GetDistributionListMembersRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	limit?: number;
	offset?: number;
}

export interface GetDistributionListMembersResponse
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dlm?: Array<{ _content: string }>;
	more?: boolean;
	total?: number;
}

const normalizeResponse = (
	response: GetDistributionListMembersResponse
): DistributionListMembersPage => ({
	total: response.total ?? 0,
	more: response.more ?? false,
	members: map(response.dlm, (item) => item._content)
});

export const getDistributionListMembers = (
	email: string,
	options: { offset?: number; limit?: number } = {}
): Promise<DistributionListMembersPage> =>
	soapFetch<
		GetDistributionListMembersRequest,
		GetDistributionListMembersResponse | ErrorSoapBodyResponse
	>('GetDistributionListMembers', {
		_jsns: NAMESPACES.account,
		dl: {
			by: 'name',
			_content: email
		},
		limit: options.limit,
		offset: options.offset
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}

		return normalizeResponse(response);
	});
