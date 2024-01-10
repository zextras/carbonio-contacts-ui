/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, first, flatMap } from 'lodash';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';
import { DistributionList, DistributionListOwner } from '../../model/distribution-list';
import { RequireAtLeastOne } from '../../types/utils';

export interface GetDistributionListRequest extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name' | 'id';
		_content: string;
	};
	needOwners?: boolean;
}

export interface GetDistributionListResponse extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: Array<{
		id: string;
		name: string;
		isOwner?: boolean;
		owners?: Array<{ owner: Array<{ id?: string; name?: string }> }>;
		_attrs?: {
			displayName?: string;
			description?: string;
		};
	}>;
}

const normalizeOwners = (
	response: GetDistributionListResponse['dl'][number]['owners']
): DistributionList['owners'] =>
	flatMap<NonNullable<typeof response>[number], DistributionListOwner>(response, (item) =>
		filter(item.owner, (owner): owner is DistributionListOwner => !!owner?.id && !!owner.name)
	);

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
		owners: normalizeOwners(dl.owners),
		description: dl._attrs?.description
	};
};

export const getDistributionList = ({
	id,
	email
}: RequireAtLeastOne<Pick<DistributionList, 'id' | 'email'>>): Promise<
	DistributionList | undefined
> => {
	if (id === undefined && email === undefined) {
		throw new Error('At least one between id and email is required');
	}
	let request: GetDistributionListRequest['dl'] = { by: 'name', _content: '' };
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
	return soapFetch<GetDistributionListRequest, GetDistributionListResponse | ErrorSoapBodyResponse>(
		'GetDistributionList',
		{
			_jsns: NAMESPACES.account,
			dl: request,
			needOwners: true
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return normalizeResponse(response);
	});
};
