/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';
import { map, size } from 'lodash';
import { http, HttpResponse, HttpResponseResolver } from 'msw';

import {
	BatchDistributionListActionRequest,
	BatchDistributionListActionResponse,
	DistributionListActionResponse
} from 'network/api/distribution-list-action';
import { SoapFault } from 'types/utils';
import { buildSoapResponse } from 'tests/utils';
import { getSetupServer } from '@jest-setup';

type DistributionListActionHandlerResponseResolver = HttpResponseResolver<
	never,
	{ Body: { BatchRequest: BatchDistributionListActionRequest } },
	SuccessSoapResponse<BatchDistributionListActionResponse>
>;

export const registerDistributionListActionHandler = (
	data: {
		membersToAdd?: Array<string>;
		membersToRemove?: Array<string>;
		displayName?: string;
		description?: string;
	},
	errors?: string[]
): jest.Mock<
	ReturnType<DistributionListActionHandlerResponseResolver>,
	Parameters<DistributionListActionHandlerResponseResolver>
> => {
	const handler = jest.fn<
		ReturnType<DistributionListActionHandlerResponseResolver>,
		Parameters<DistributionListActionHandlerResponseResolver>
	>(async () => {
		const responses: Array<DistributionListActionResponse> = [];
		if (size(data.membersToAdd) > 0) {
			responses.push({
				_jsns: JSNS.ACCOUNT
			});
		}
		if (size(data.membersToRemove) > 0) {
			responses.push({
				_jsns: JSNS.ACCOUNT
			});
		}
		if (data.displayName !== undefined || data.description !== undefined) {
			responses.push({
				_jsns: JSNS.ACCOUNT
			});
		}

		const actionResponse =
			responses.length > 0 ? { DistributionListActionResponse: responses } : {};

		const fault =
			errors && errors.length > 0
				? {
						Fault: map(
							errors,
							(error): SoapFault => ({
								Code: { Value: '' },
								Reason: { Text: error },
								Detail: { Error: { Trace: error, Code: '' } }
							})
						)
					}
				: {};

		return HttpResponse.json(
			buildSoapResponse<BatchDistributionListActionResponse>({
				BatchResponse: {
					_jsns: JSNS.ALL,
					...actionResponse,
					...fault
				}
			})
		);
	});
	getSetupServer().use(http.post('/service/soap/BatchRequest', handler));
	return handler;
};
