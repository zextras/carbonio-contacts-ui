/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapFault, SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { map, size } from 'lodash';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import {
	BatchDistributionListActionRequest,
	BatchDistributionListActionResponse,
	DistributionListActionResponse
} from '../../network/api/distribution-list-action';
import { buildSoapResponse } from '../utils';

type DistributionListActionHandlerResponseResolver = ResponseResolver<
	RestRequest<{ Body: { BatchRequest: BatchDistributionListActionRequest } }, never>,
	RestContext,
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
	>(async (req, res, ctx) => {
		const responses: Array<DistributionListActionResponse> = [];
		if (size(data.membersToAdd) > 0) {
			responses.push({
				_jsns: NAMESPACES.account
			});
		}
		if (size(data.membersToRemove) > 0) {
			responses.push({
				_jsns: NAMESPACES.account
			});
		}
		if (data.displayName !== undefined || data.description !== undefined) {
			responses.push({
				_jsns: NAMESPACES.account
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
								Reason: { Text: error },
								Detail: { Error: { Detail: error, Code: '' } }
							})
						)
				  }
				: {};

		return res(
			ctx.json(
				buildSoapResponse<BatchDistributionListActionResponse>({
					BatchResponse: {
						_jsns: NAMESPACES.generic,
						...actionResponse,
						...fault
					}
				})
			)
		);
	});
	getSetupServer().use(rest.post('/service/soap/BatchRequest', handler));
	return handler;
};
