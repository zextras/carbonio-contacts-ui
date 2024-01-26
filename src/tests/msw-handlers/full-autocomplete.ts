/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { ResponseResolver, rest, RestContext, RestRequest } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { NAMESPACES } from '../../constants/api';
import { FullAutocompleteResponse, Match } from '../../legacy/types/contact';
import { buildSoapResponse } from '../utils';

const createAutocompleteResponse = (match: Array<Match>): string => {
	const matchString = match.map((item) => {
		const full = item.full ?? [item.first ?? '', item.last ?? ''].join(' ');
		const filledMatch: Record<keyof Match, string> = {
			first: item.first ?? '',
			last: item.last ?? '',
			full,
			email: `&quot;${full}&quot; &lt;${item.email ?? ''}&gt;`,
			isGroup: item.isGroup ? '1' : '0',
			type: item.type ?? '',
			fileas: item.fileas ?? `8:${full}`,
			ranking: item.ranking ?? ''
		};
		return `<match last="${filledMatch.last}" fileas="${filledMatch.fileas}" ranking="${filledMatch.ranking}" type="${filledMatch.type}" isGroup="${filledMatch.isGroup}" email="${filledMatch.email}" first="${filledMatch.first}" full="${full}" />`;
	});

	return `<FullAutocompleteResponse canBeCached='0' xmlns='${NAMESPACES.mail}'>
		${matchString}
		</FullAutocompleteResponse>`;
};
type FullAutoCompleteHandler = ResponseResolver<
	RestRequest<{ Body: { FullAutocompleteRequest: FullAutocompleteResponse } }>,
	RestContext,
	SoapResponse<string>
>;
export const registerFullAutocompleteHandler = (
	results: Array<Match>
): jest.Mock<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>> => {
	const handler = jest.fn<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>>(
		(req, res, ctx) =>
			res(
				ctx.json(
					buildSoapResponse<string>({
						FullAutocompleteResponse: createAutocompleteResponse(results)
					})
				)
			)
	);
	getSetupServer().use(rest.post('/service/soap/FullAutocompleteRequest', handler));

	return handler;
};
