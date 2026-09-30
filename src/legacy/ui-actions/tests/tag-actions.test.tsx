/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Tag, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';

import { screen, setupTest } from '@test-setup';
import { Contact } from 'legacy/types/contact';
import { applyMultiTag, TagsDropdownItem } from 'legacy/ui-actions/tag-actions';

const contact = { id: '42', tags: [] } as unknown as Contact;
const customTag: Tag = { id: '10', name: 'work', rgb: '#abcdef' };
const standardTag: Tag = { id: '11', name: 'home', color: 4 };

describe('TagsDropdownItem', () => {
	it.each([
		['custom', customTag, '#abcdef'],
		['standard', standardTag, ZIMBRA_STANDARD_COLORS[4].hex]
	])('colors the tag icon with the %s color of the tag', (_, tag, expectedColor) => {
		setupTest(<TagsDropdownItem tag={tag} contact={contact} />);

		expect(screen.getByTestId('icon: TagOutline')).toHaveStyleRule('color', expectedColor);
	});
});

describe('applyMultiTag', () => {
	it.each([
		['custom', customTag, '#abcdef'],
		['standard', standardTag, ZIMBRA_STANDARD_COLORS[4].hex]
	])('colors the tag icon of each item with the %s color of the tag', (_, tag, expectedColor) => {
		const action = applyMultiTag({
			t: ((key: string) => key) as unknown as TFunction,
			tags: { [tag.id]: tag },
			ids: ['42'],
			itemsToTag: [{ id: '42', tags: [] }] as unknown as Parameters<
				typeof applyMultiTag
			>[0]['itemsToTag']
		});
		const [item] = action.items as Array<{ customComponent: ReactElement }>;

		setupTest(item.customComponent);

		expect(screen.getByTestId('icon: TagOutline')).toHaveStyleRule('color', expectedColor);
	});
});
