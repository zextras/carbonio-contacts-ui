/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NameSpace } from '@zextras/carbonio-shell-ui';

export const NAMESPACES = {
	account: 'urn:zimbraAccount',
	mail: 'urn:zimbraMail',
	generic: 'urn:zimbra'
} satisfies Record<string, NameSpace>;

interface GenericSoapRequest<NS extends NameSpace> {
	_jsns: NS;
}

export interface GetDistributionListMembersRequest
	extends GenericSoapRequest<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
}
