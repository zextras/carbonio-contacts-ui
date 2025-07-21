/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BooleanString } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { map } from 'lodash';

import { DistributionList } from 'model/distribution-list';
import { GenericSoapPayload } from 'network/api/types';

type Attributes = {
	description?: string;
	zimbraHideInGal?: BooleanString;
};

export interface GetAccountDistributionListsRequest
	extends GenericSoapPayload<typeof JSNS.ACCOUNT> {
	ownerOf?: boolean;
	memberOf?: 'none' | 'all' | 'directOnly';
	attrs?: string;
}

export type GetAccountDistributionListsResponse = GenericSoapPayload<typeof JSNS.ACCOUNT> & {
	dl?: Array<{
		id: string;
		name: string;
		isOwner?: boolean;
		isMember?: boolean;
		// display name
		d?: string;
		_attrs?: Attributes;
	}>;
};

const normalizeResponse = (
	response: GetAccountDistributionListsResponse
): Array<DistributionList> =>
	map(response.dl, (item) => ({
		id: item.id,
		email: item.name,
		displayName: item.d,
		isOwner: item.isOwner,
		isMember: item.isMember,
		description: item._attrs?.description,
		canRequireMembers: item._attrs?.zimbraHideInGal !== 'TRUE' || item.isOwner === true
	}));

export const getAccountDistributionLists = (options: {
	ownerOf: boolean;
	memberOf: boolean;
}): Promise<Array<DistributionList>> =>
	legacySoapFetch<
		GetAccountDistributionListsRequest,
		GetAccountDistributionListsResponse | ErrorSoapBodyResponse
	>('GetAccountDistributionLists', {
		_jsns: JSNS.ACCOUNT,
		ownerOf: options.ownerOf,
		memberOf: options.memberOf ? 'all' : 'none',
		attrs: 'description,zimbraHideInGal'
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return normalizeResponse(response);
	});
