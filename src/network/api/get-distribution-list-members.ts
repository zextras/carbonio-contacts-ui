/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { DistributionListMembersPage } from '../../model/distribution-list';

export interface GetDistributionListMembersRequest extends GenericSoapPayload<typeof JSNS.account> {
	dl: {
		// get members request works only by passing the email as content of the dl field
		_content: string;
	};
	limit?: number;
	offset?: number;
}

export type GetDistributionListMembersResponse = GenericSoapPayload<typeof JSNS.account> & {
	dlm?: Array<{ _content: string }>;
	more?: boolean;
	total?: number;
};

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
		_jsns: JSNS.account,
		dl: {
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
