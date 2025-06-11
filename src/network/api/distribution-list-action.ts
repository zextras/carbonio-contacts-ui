/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { GenericSoapPayload } from 'network/api/types';
import { SoapFault } from 'types/utils';

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

export interface DistributionListActionRequest extends GenericSoapPayload<typeof JSNS.ACCOUNT> {
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

export type DistributionListActionResponse = GenericSoapPayload<typeof JSNS.ACCOUNT>;

export type BatchDistributionListActionRequest = GenericSoapPayload<typeof JSNS.ALL> & {
	DistributionListActionRequest: Array<DistributionListActionRequest>;
};

export type BatchDistributionListActionResponse = GenericSoapPayload<typeof JSNS.ALL> & {
	DistributionListActionResponse?: Array<DistributionListActionResponse>;
	Fault?: Array<SoapFault>;
};

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
			_jsns: JSNS.ACCOUNT,
			requestId: 'modify'
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
			_jsns: JSNS.ACCOUNT,
			requestId: 'addMembers'
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
			_jsns: JSNS.ACCOUNT,
			requestId: 'removeMembers'
		});
	}

	if (actionRequests.length === 0) {
		return Promise.resolve();
	}

	return soapFetch<BatchDistributionListActionRequest, BatchDistributionListActionResponse>(
		'Batch',
		{
			DistributionListActionRequest: actionRequests,
			_jsns: JSNS.ALL
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
