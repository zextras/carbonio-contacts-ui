/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parseFullAutocompleteXML } from '../autocomplete';

describe('parseFullAutocompleteXML', () => {
	test('all fields should be parsed', () => {
		const xmlString =
			'<FullAutocompleteResponse canBeCached="0" xmlns="some_namespace"><match last="Doe" fileas="8:John Doe" id="555" l="13" company="company" exp="0" ranking="0" type="gal" isGroup="0" nick="nickname"  middle="Patrick" email="&quot;John Doe&quot; &lt;john@example.com>" first="John" full="John Doe" display="johndoe"/></FullAutocompleteResponse>';
		const result = parseFullAutocompleteXML(xmlString);
		const expectedResult = {
			match: [
				{
					email: `"John Doe" <john@example.com>`,
					type: 'gal',
					ranking: '0',
					isGroup: false,
					exp: '0',
					id: '555',
					l: '13',
					display: 'johndoe',
					first: 'John',
					middle: 'Patrick',
					last: 'Doe',
					full: 'John Doe',
					nick: 'nickname',
					company: 'company',
					fileas: '8:John Doe'
				}
			],
			_attributes: {
				canBeCached: '0',
				xmlns: 'some_namespace'
			}
		};

		expect(result).toEqual(expectedResult);
	});
});
