/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export type DistributionListActionOperation = 'addMembers' | 'removeMembers';

export interface DistributionListActionRequest
	extends GenericSoapPayload<typeof NAMESPACES.account> {
	dl: {
		by: 'name';
		_content: string;
	};
	action: {
		op: DistributionListActionOperation;
		dlm: Array<{
			_content: string;
		}>;
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

export const distributionListAction = (
	email: string,
	membersToAdd: Array<string>,
	membersToRemove: Array<string>
): Promise<void> => {
	if (!membersToAdd.length && !membersToRemove.length) {
		return Promise.resolve();
	}

	const actionRequests: Array<DistributionListActionRequest> = [];

	if (membersToAdd.length > 0) {
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

	if (membersToRemove.length > 0) {
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
