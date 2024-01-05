/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { first, reduce } from 'lodash';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';
import { DistributionList } from '../../model/distribution-list';

export interface GetDistributionListRequest extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	needOwners?: number;
}

export interface GetDistributionListResponse extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: Array<{
		id: string;
		name: string;
		isOwner?: boolean;
		owners?: Array<{ owner: Array<{ id?: string; name?: string }> }>;
		_attrs?: {
			displayName?: string;
		};
	}>;
}

const normalizeResponse = (response: GetDistributionListResponse): DistributionList | undefined => {
	const dl = first(response.dl);
	if (dl === undefined) {
		return undefined;
	}

	return {
		id: dl.id,
		email: dl.name,
		displayName: dl._attrs?.displayName,
		isOwner: dl.isOwner ?? false,
		owners: reduce<NonNullable<typeof dl.owners>[number], NonNullable<DistributionList['owners']>>(
			dl.owners,
			(result, item) => {
				const owner = first(item.owner);
				if (owner?.id !== undefined && owner.name) {
					result.push({ id: owner.id, name: owner.name });
				}
				return result;
			},
			[]
		)
	};
};

export const getDistributionList = (email: string): Promise<DistributionList | undefined> =>
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
		return normalizeResponse(response);
	});
