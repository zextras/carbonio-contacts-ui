/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SoapResponse } from '@zextras/carbonio-shell-ui';
import { HttpResponseResolver, http, HttpResponse } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { FullAutocompleteResponse, Match } from '../../legacy/types/contact';
import { buildSoapResponse } from '../utils';

const createAutocompleteResponse = (match: Array<Match>): FullAutocompleteResponse => {
	const matchString = match.map((item) => {
		const full = item.full ?? [item.first ?? '', item.last ?? ''].join(' ');
		const filledMatch: Match = {
			first: item.first ?? '',
			last: item.last ?? '',
			full,
			email: `&quot;${full}&quot; &lt;${item.email ?? ''}&gt;`,
			isGroup: item.isGroup,
			type: item.type ?? '',
			fileas: item.fileas ?? `8:${full}`,
			ranking: item.ranking ?? ''
		};
		return filledMatch;
	});
	return {
		_jsns: 'urn:zimbraMail',
		canBeCached: false,
		match: matchString
	};
};
type FullAutoCompleteHandler = HttpResponseResolver<
	never,
	{ Body: { FullAutocompleteRequest: FullAutocompleteResponse } },
	SoapResponse<FullAutocompleteResponse>
>;
export const registerFullAutocompleteHandler = (
	results: Array<Match>
): jest.Mock<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>> => {
	const handler = jest.fn<ReturnType<FullAutoCompleteHandler>, Parameters<FullAutoCompleteHandler>>(
		() =>
			HttpResponse.json(
				buildSoapResponse<FullAutocompleteResponse>({
					FullAutocompleteResponse: createAutocompleteResponse(results)
				})
			)
	);
	getSetupServer().use(http.post('/service/soap/FullAutocompleteRequest', handler));

	return handler;
};
