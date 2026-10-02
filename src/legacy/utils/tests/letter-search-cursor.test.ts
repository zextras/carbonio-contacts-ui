/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { OTHER_INITIAL } from 'legacy/utils/contact-initial';
import { getLetterCursor } from 'legacy/utils/letter-search-cursor';

describe('getLetterCursor', () => {
	it('should return undefined when no letter is selected', () => {
		expect(getLetterCursor(null)).toBeUndefined();
	});

	it('should map a regular letter to its lower cased bounds', () => {
		expect(getLetterCursor('A')).toEqual({ sortVal: 'a', endSortVal: 'b' });
		expect(getLetterCursor('B')).toEqual({ sortVal: 'b', endSortVal: 'c' });
	});

	it('should leave the upper bound open for the last letter', () => {
		expect(getLetterCursor('Z')).toEqual({ sortVal: 'z' });
		expect(getLetterCursor('Z')).not.toHaveProperty('endSortVal');
	});

	it('should bound the other-initial bucket to everything sorting before a', () => {
		expect(getLetterCursor(OTHER_INITIAL)).toEqual({ sortVal: '', endSortVal: 'a' });
	});

	it('should return undefined for a value that is neither a letter nor the other bucket', () => {
		expect(getLetterCursor('not-a-letter')).toBeUndefined();
	});
});
