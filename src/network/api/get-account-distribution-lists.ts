/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BooleanString, ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';

type Attributes = {
	description?: string;
	zimbraHideInGal?: BooleanString;
};

export interface GetAccountDistributionListsRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	ownerOf?: boolean;
	memberOf?: 'none' | 'all' | 'directOnly';
	attrs?: string;
}

export interface GetAccountDistributionListsResponse
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl?: Array<{
		id: string;
		name: string;
		isOwner?: boolean;
		isMember?: boolean;
		// display name
		d?: string;
		_attrs?: Attributes;
	}>;
}

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
	soapFetch<
		GetAccountDistributionListsRequest,
		GetAccountDistributionListsResponse | ErrorSoapBodyResponse
	>('GetAccountDistributionLists', {
		_jsns: NAMESPACES.account,
		ownerOf: options.ownerOf,
		memberOf: options.memberOf ? 'all' : 'none',
		attrs: 'description,zimbraHideInGal'
	}).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return normalizeResponse(response);
	});
