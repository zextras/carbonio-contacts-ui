/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Tags } from '@zextras/carbonio-shell-ui';

import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { Contact } from '../../types/contact';
import { getTagsArray } from '../tags';

describe('getTagsArray', () => {
	const tagsMap: Tags = {
		tag1: { id: 'tag1', name: 'Tag 1', color: 1 },
		tag2: { id: 'tag2', name: 'Tag 2', color: 2 }
	};

	const itemTags: Contact['tags'] = ['tag1', 'tag2'];

	it('should return an empty array when itemTags is empty', () => {
		const result = getTagsArray(tagsMap, []);
		expect(result).toEqual([]);
	});

	it('should return an array of tags that exist in tagsMap', () => {
		const result = getTagsArray(tagsMap, itemTags);
		expect(result).toEqual([
			{
				id: 'tag1',
				name: 'Tag 1',
				color: ZIMBRA_STANDARD_COLORS[1].hex
			},
			{
				id: 'tag2',
				name: 'Tag 2',
				color: ZIMBRA_STANDARD_COLORS[2].hex
			}
		]);
	});

	it('should ignore tags that do not exist in tagsMap', () => {
		const result = getTagsArray(tagsMap, ['tag1', 'tag3']);
		expect(result).toEqual([
			{
				id: 'tag1',
				name: 'Tag 1',
				color: ZIMBRA_STANDARD_COLORS[1].hex
			}
		]);
	});
});
