/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { normalizeSyncContactsFromSoap } from 'legacy/utils/normalizations/normalize-contact-from-soap';

describe('normalizeContactFromSoap', () => {
	describe('normalizeSyncContactFromSoap', () => {
		it('should return empty array tags when receiving empty string', () => {
			const partialContactWithId = {
				id: '1',
				t: ''
			};

			const result = normalizeSyncContactsFromSoap([partialContactWithId]);

			expect(result).toEqual([{ id: '1', tags: [] }]);
		});
		it('should return undefined tags when receiving undefined', () => {
			const partialContactWithId = {
				id: '1',
				t: undefined
			};

			const result = normalizeSyncContactsFromSoap([partialContactWithId]);

			expect(result).toEqual([{ id: '1' }]);
		});
	});
});
