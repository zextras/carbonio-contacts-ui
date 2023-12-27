/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forEach } from 'lodash';

import { FullAutocompleteResponse } from '../types/contact';

export function parseFullAutocompleteXML(xmlString: string): FullAutocompleteResponse {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

	const fullAutocompleteResponse: FullAutocompleteResponse = {
		match: [],
		_attributes: {
			canBeCached: xmlDoc.documentElement.getAttribute('canBeCached'),
			xmlns: xmlDoc.documentElement.getAttribute('xmlns')
		}
	};

	const matchElements = xmlDoc.documentElement.getElementsByTagName('match');
	forEach(matchElements, (matchElement) => {
		const match = {
			first: matchElement.getAttribute('first') ?? undefined,
			last: matchElement.getAttribute('last') ?? undefined,
			fileas: matchElement.getAttribute('fileas') ?? undefined,
			ranking: matchElement.getAttribute('ranking') ?? undefined,
			type: matchElement.getAttribute('type') ?? undefined,
			isGroup: matchElement.getAttribute('isGroup') === '1',
			email: matchElement.getAttribute('email') ?? undefined,
			full: matchElement.getAttribute('full') ?? undefined,
			company: matchElement.getAttribute('company') ?? undefined,
			id: matchElement.getAttribute('id') ?? undefined,
			l: matchElement.getAttribute('l') ?? undefined,
			exp: matchElement.getAttribute('exp') ?? undefined,
			display: matchElement.getAttribute('display') ?? undefined,
			middle: matchElement.getAttribute('middle') ?? undefined,
			nick: matchElement.getAttribute('nick') ?? undefined
		};
		fullAutocompleteResponse.match?.push(match);
	});

	return fullAutocompleteResponse;
}
