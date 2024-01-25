/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export type DistributionListActionOperationMembers = 'addMembers' | 'removeMembers';
export type DistributionListActionOperationModify = 'modify';

export type DistributionListAttributes = {
	displayName?: string;
	description?: string;
};

type MappedAttributes = NonNullable<
	{
		[K in keyof DistributionListAttributes]-?: {
			n: K;
			_content: NonNullable<DistributionListAttributes[K]>;
		};
	}[keyof DistributionListAttributes]
>;

type AttributesArray = Array<MappedAttributes>;

export interface DistributionListActionRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	action:
		| {
				op: DistributionListActionOperationMembers;
				dlm: Array<{
					_content: string;
				}>;
		  }
		| {
				op: DistributionListActionOperationModify;
				a: AttributesArray;
		  };
}

export type DistributionListActionResponse = GenericSoapPayload<typeof NAMESPACES.account>;

export interface BatchDistributionListActionRequest
	extends GenericSoapPayload<typeof NAMESPACES.generic> {
	DistributionListActionRequest: Array<DistributionListActionRequest>;
}

export interface BatchDistributionListActionResponse
	extends GenericSoapPayload<typeof NAMESPACES.generic> {
	DistributionListActionResponse?: Array<DistributionListActionResponse>;
	Fault?: Array<SoapFault>;
}

export const distributionListAction = ({
	email,
	displayName,
	description,
	membersToRemove,
	membersToAdd
}: {
	email: string;
	displayName?: string;
	description?: string;
	membersToAdd?: Array<string>;
	membersToRemove?: Array<string>;
}): Promise<void> => {
	const actionRequests: Array<DistributionListActionRequest> = [];

	if (displayName !== undefined || description !== undefined) {
		const attributes: AttributesArray = [];
		if (displayName !== undefined) {
			attributes.push({ n: 'displayName', _content: displayName });
		}
		if (description !== undefined) {
			attributes.push({ n: 'description', _content: description });
		}

		actionRequests.push({
			dl: {
				by: 'name',
				_content: email
			},
			action: {
				op: 'modify',
				a: attributes
			},
			_jsns: NAMESPACES.account
		});
	}

	if (membersToAdd && membersToAdd.length > 0) {
		actionRequests.push({
			dl: {
				by: 'name',
				_content: email
			},
			action: {
				op: 'addMembers',
				dlm: membersToAdd.map((member) => ({ _content: member }))
			},
			_jsns: NAMESPACES.account
		});
	}

	if (membersToRemove && membersToRemove.length > 0) {
		actionRequests.push({
			dl: {
				by: 'name',
				_content: email
			},
			action: {
				op: 'removeMembers',
				dlm: membersToRemove.map((member) => ({ _content: member }))
			},
			_jsns: NAMESPACES.account
		});
	}

	if (actionRequests.length === 0) {
		return Promise.resolve();
	}

	return soapFetch<BatchDistributionListActionRequest, BatchDistributionListActionResponse>(
		'Batch',
		{
			DistributionListActionRequest: actionRequests,
			_jsns: NAMESPACES.generic
		}
	).then((response) => {
		if ('Fault' in response) {
			// TODO create a specific BatchSoapError
			throw new Error(response.Fault?.map((fault) => fault.Reason.Text).join(',\n'), {
				cause: response.Fault
			});
		}
	});
};
