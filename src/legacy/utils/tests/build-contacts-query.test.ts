/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildContactsQuery, FILTER_TYPES } from 'legacy/utils/build-contacts-query';

describe('buildContactsQuery', () => {
	it('should only scope the search to the folder for the ALL filter', () => {
		expect(buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.ALL })).toBe('inid:"7"');
	});

	it('should exclude groups for the CONTACT filter', () => {
		expect(buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.CONTACT })).toBe(
			'inid:"7" and not #type:group'
		);
	});

	it('should only keep groups for the CONTACT_GROUP filter', () => {
		expect(buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.CONTACT_GROUP })).toBe(
			'inid:"7" and #type:group'
		);
	});

	it('should work on a mountpoint folder id', () => {
		expect(buildContactsQuery({ folderId: 'a1b2:257', filterType: FILTER_TYPES.CONTACT })).toBe(
			'inid:"a1b2:257" and not #type:group'
		);
	});
});
