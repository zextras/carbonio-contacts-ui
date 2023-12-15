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
			first: matchElement.getAttribute('first') ?? '',
			last: matchElement.getAttribute('last') ?? '',
			fileas: matchElement.getAttribute('fileas') ?? '',
			ranking: matchElement.getAttribute('ranking') ?? '',
			type: matchElement.getAttribute('type') ?? '',
			isGroup: matchElement.getAttribute('isGroup') === '1',
			email: matchElement.getAttribute('email') ?? '',
			full: matchElement.getAttribute('full') ?? ''
		};
		fullAutocompleteResponse.match?.push(match);
	});

	return fullAutocompleteResponse;
}
