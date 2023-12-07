/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NameSpace } from '@zextras/carbonio-shell-ui';

// TODO move into Shell
export const NAMESPACES = {
	account: 'urn:zimbraAccount',
	mail: 'urn:zimbraMail',
	generic: 'urn:zimbra'
} satisfies Record<string, NameSpace>;

interface GenericSoapPayload<NS extends NameSpace> {
	_jsns: NS;
}

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
