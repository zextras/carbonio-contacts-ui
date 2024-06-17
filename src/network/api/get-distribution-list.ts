/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BooleanString, ErrorSoapBodyResponse, JSNS, soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, first, flatMap } from 'lodash';

import { GenericSoapPayload } from './types';
import { DistributionList, DistributionListOwner } from '../../model/distribution-list';

export interface GetDistributionListRequest extends GenericSoapPayload<typeof JSNS.account> {
	dl: {
		by: 'name' | 'id';
		_content: string;
	};
	needOwners?: boolean;
}

export type GetDistributionListResponse = GenericSoapPayload<typeof JSNS.account> & {
	dl: Array<{
		id: string;
		name: string;
		isOwner?: boolean;
		isMember?: boolean;
		owners?: Array<{ owner: Array<{ id?: string; name?: string }> }>;
		_attrs?: {
			displayName?: string;
			description?: string;
			zimbraHideInGal?: BooleanString;
		};
	}>;
};

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
		displayName: dl._attrs?.displayName ?? '',
		isOwner: dl.isOwner ?? false,
		isMember: dl.isMember ?? false,
		owners: normalizeOwners(dl.owners),
		description: dl._attrs?.description ?? '',
		canRequireMembers: dl._attrs?.zimbraHideInGal !== 'TRUE' || dl.isOwner === true
	};
};

export const getDistributionList = ({
	id,
	email
}: Partial<Pick<DistributionList, 'id' | 'email'>>): Promise<DistributionList | undefined> => {
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
			_jsns: JSNS.account,
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
