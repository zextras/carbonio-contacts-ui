/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildContactsQuery, FILTER_TYPES } from 'legacy/utils/build-contacts-query';
import { DIGITS, OTHER_INITIAL } from 'legacy/utils/contact-initial';

const CONTACT_L_CLAUSE =
	'(#displayName:L* or (#displayName:"" and ' +
	'(#firstName:L* or (#firstName:"" and ' +
	'(#lastName:L* or (#lastName:"" and #email:L*))))))';

const anyDigit = (field: string): string =>
	`(${DIGITS.map((digit) => `#${field}:${digit}*`).join(' or ')})`;

const CONTACT_DIGITS_CLAUSE =
	`(${anyDigit('displayName')} or (#displayName:"" and ` +
	`(${anyDigit('firstName')} or (#firstName:"" and ` +
	`(${anyDigit('lastName')} or (#lastName:"" and ${anyDigit('email')}))))))`;

const DIGITS_FULLNAME_CLAUSE = anyDigit('fullName');

describe('buildContactsQuery', () => {
	describe('without a letter', () => {
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
	});

	describe('with a letter', () => {
		it('should replicate the display name cascade for the CONTACT filter', () => {
			expect(
				buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.CONTACT, letter: 'L' })
			).toBe(`inid:"7" and not #type:group and ${CONTACT_L_CLAUSE}`);
		});

		it('should match on the group title for the CONTACT_GROUP filter', () => {
			expect(
				buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.CONTACT_GROUP, letter: 'L' })
			).toBe('inid:"7" and #type:group and #fullName:L*');
		});

		it('should match contacts and groups on their own fields for the ALL filter', () => {
			expect(buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.ALL, letter: 'L' })).toBe(
				`inid:"7" and ((not #type:group and ${CONTACT_L_CLAUSE})` +
					' or (#type:group and #fullName:L*))'
			);
		});

		it('should work on a mountpoint folder id', () => {
			expect(
				buildContactsQuery({
					folderId: 'a1b2:257',
					filterType: FILTER_TYPES.CONTACT,
					letter: 'A'
				})
			).toContain('inid:"a1b2:257" and not #type:group and (#displayName:A*');
		});
	});

	describe('with the digits bucket', () => {
		it('should match any digit on every field of the cascade for the CONTACT filter', () => {
			expect(
				buildContactsQuery({
					folderId: '7',
					filterType: FILTER_TYPES.CONTACT,
					letter: OTHER_INITIAL
				})
			).toBe(`inid:"7" and not #type:group and ${CONTACT_DIGITS_CLAUSE}`);
		});

		it('should match any digit on the group title for the CONTACT_GROUP filter', () => {
			expect(
				buildContactsQuery({
					folderId: '7',
					filterType: FILTER_TYPES.CONTACT_GROUP,
					letter: OTHER_INITIAL
				})
			).toBe(`inid:"7" and #type:group and ${DIGITS_FULLNAME_CLAUSE}`);
		});

		it('should match contacts and groups on their own fields for the ALL filter', () => {
			expect(
				buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.ALL, letter: OTHER_INITIAL })
			).toBe(
				`inid:"7" and ((not #type:group and ${CONTACT_DIGITS_CLAUSE})` +
					` or (#type:group and ${DIGITS_FULLNAME_CLAUSE}))`
			);
		});

		it('should cover every digit from 0 to 9', () => {
			const query = buildContactsQuery({
				folderId: '7',
				filterType: FILTER_TYPES.CONTACT,
				letter: OTHER_INITIAL
			});
			DIGITS.forEach((digit) => {
				expect(query).toContain(`#displayName:${digit}*`);
				expect(query).toContain(`#email:${digit}*`);
			});
		});

		it('should not match the bucket label itself', () => {
			expect(
				buildContactsQuery({
					folderId: '7',
					filterType: FILTER_TYPES.CONTACT,
					letter: OTHER_INITIAL
				})
			).not.toContain(`#displayName:${OTHER_INITIAL}*`);
		});
	});

	describe('letter validation', () => {
		it.each([null, undefined, '', 'AB', 'è', '1', '#', '*', 'a* or x'])(
			'should ignore the invalid letter %p',
			(letter) => {
				expect(buildContactsQuery({ folderId: '7', filterType: FILTER_TYPES.ALL, letter })).toBe(
					'inid:"7"'
				);
			}
		);
	});
});
