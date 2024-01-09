/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';
import { DistributionList, DistributionListMembersPage } from '../../model/distribution-list';
import { RequireAtLeastOne } from '../../types/utils';

export interface GetDistributionListMembersRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name' | 'id';
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
	{ id, email }: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>>,
	options: { offset?: number; limit?: number } = {}
): Promise<DistributionListMembersPage> => {
	if (id === undefined && email === undefined) {
		throw new Error('At least one between id and email is required');
	}
	let request: GetDistributionListMembersRequest['dl'] = { by: 'name', _content: '' };
	if (email !== undefined) {
		request = {
			by: 'name',
			_content: email
		};
	} else if (id !== undefined) {
		request = {
			by: 'id',
			_content: id
		};
	}

	return soapFetch<
		GetDistributionListMembersRequest,
		GetDistributionListMembersResponse | ErrorSoapBodyResponse
	>('GetDistributionListMembers', {
		_jsns: NAMESPACES.account,
		dl: request,
		limit: options.limit,
		offset: options.offset
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}

		return normalizeResponse(response);
	});
};
