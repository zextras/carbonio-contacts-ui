/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { containsSpecialCharacters } from '../search-view';

describe('containsSpecialCharacters', () => {
	describe('should handle boolean values', () => {
		it('should return false for a boolean true input', () => {
			expect(containsSpecialCharacters(true)).toBe(false);
		});

		it('should return false for a boolean false input', () => {
			expect(containsSpecialCharacters(false)).toBe(false);
		});
	});
});
