/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CONTACT_TYPES } from '@zextras/carbonio-ui-commons';

import {
	type ChipBox,
	findDropTarget,
	getContactLabel,
	insertChipAt,
	mapToChipContactOptions
} from 'legacy/integrations/parts/utils';
import { RemoteDistributionListContact } from 'legacy/integrations/types';

describe('utils', () => {
	describe('getContactLabel', () => {
		it('should return display name for distribution list when fullName is provided', () => {
			const distributionListContact = {
				id: 'dl@example.com',
				email: 'dl@example.com',
				type: CONTACT_TYPES.DISTRIBUTION_LIST,
				fullName: 'My Distribution List'
			};

			const label = getContactLabel(distributionListContact);

			expect(label).toBe('My Distribution List');
		});

		it('should fallback to email for distribution list when fullName is not provided', () => {
			const distributionListContact = {
				id: 'dl@example.com',
				email: 'dl@example.com',
				type: CONTACT_TYPES.DISTRIBUTION_LIST
			};

			const label = getContactLabel(distributionListContact);

			expect(label).toBe('dl@example.com');
		});

		it('should fallback to email for distribution list when fullName is empty', () => {
			const distributionListContact = {
				id: 'dl@example.com',
				email: 'dl@example.com',
				type: CONTACT_TYPES.DISTRIBUTION_LIST,
				fullName: ''
			};

			const label = getContactLabel(distributionListContact);

			expect(label).toBe('dl@example.com');
		});

		it('should prioritize displayName(display) over firstName + lastName for person contact', () => {
			const personContact = {
				id: '123456',
				email: 'john.joe@example.com',
				display: 'John J. – Sales Team',
				firstName: 'John',
				lastName: 'Joe',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John J. – Sales Team');
		});

		it('should fallback to firstName + lastName when displayName is empty', () => {
			const personContact = {
				id: '123424',
				email: 'john.boe@example.com',
				display: '',
				firstName: 'John',
				lastName: 'Boe',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John Boe');
		});

		it('should fallback to firstName + lastName when displayName is undefined', () => {
			const personContact = {
				id: '123456',
				email: 'john.toe@example.com',
				firstName: 'John',
				lastName: 'Toe',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John Toe');
		});

		it('should fallback to fullName when no displayName and no name parts available', () => {
			const personContact = {
				id: '12321431',
				email: 'john.qoe@example.com',
				fullName: 'John Qoe Full',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John Qoe Full');
		});

		it('should fallback to email when no displayName, no name parts, and no fullName available', () => {
			const personContact = {
				id: 'john.poe@example.com',
				email: 'john.poe@example.com',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('john.poe@example.com');
		});

		it('should prioritize displayName over fullName', () => {
			const personContact = {
				id: '435345345',
				email: 'john.loe@example.com',
				display: 'John L. – Sales Team',
				fullName: 'John Loe Full',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John L. – Sales Team');
		});

		it('should trim whitespace from displayName', () => {
			const personContact = {
				id: '1354646',
				email: 'john.koe@example.com',
				display: '  John K. – Sales Team  ', // Intentionally added spaces
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John K. – Sales Team');
		});
	});

	describe('mapToChipContactOptions', () => {
		it('should create distribution list option with display name from autocomplete response', () => {
			const autocompleteResponse: RemoteDistributionListContact = {
				isGroup: true,
				email: '"MyDistributionList One" <mydist@example.com>',
				exp: false,
				full: 'MyDistributionList One',
				fileas: '8:MyDistributionList One'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('MyDistributionList One');
			expect(result.value).toEqual(
				expect.objectContaining({
					type: CONTACT_TYPES.DISTRIBUTION_LIST,
					fullName: 'MyDistributionList One'
				})
			);
		});

		it('should create distribution list option with parsed email when display name is not available', () => {
			const autocompleteResponse: RemoteDistributionListContact = {
				isGroup: true,
				email: 'mydist@example.com',
				exp: false,
				full: '',
				fileas: '8:mydist@example.com'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('mydist@example.com');
			expect(result.value).toEqual(
				expect.objectContaining({
					type: CONTACT_TYPES.DISTRIBUTION_LIST,
					email: 'mydist@example.com',
					fullName: ''
				})
			);
		});

		it('should handle complex email format with display name', () => {
			const autocompleteResponse: RemoteDistributionListContact = {
				isGroup: true,
				email: '"Sales Team Distribution" <sales-team@company.com>',
				exp: false,
				full: 'Sales Team Distribution',
				fileas: '8:Sales Team Distribution'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('Sales Team Distribution');
			expect(result.value).toEqual(
				expect.objectContaining({
					type: CONTACT_TYPES.DISTRIBUTION_LIST,
					email: 'sales-team@company.com',
					fullName: 'Sales Team Distribution'
				})
			);
		});

		it('should create distribution list with correct structure including all required properties', () => {
			const autocompleteResponse: RemoteDistributionListContact = {
				isGroup: true,
				email: '"Test DL" <test@example.com>',
				exp: false,
				full: 'Test Distribution List',
				fileas: '8:Test Distribution List'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result).toEqual({
				label: 'Test Distribution List',
				value: expect.objectContaining({
					id: 'test@example.com',
					email: 'test@example.com',
					type: CONTACT_TYPES.DISTRIBUTION_LIST,
					fullName: 'Test Distribution List'
				}),
				id: 'test@example.com',
				customComponent: expect.any(Object)
			});
		});
	});

	describe('extractDisplayNameFromEmail functionality', () => {
		it('should extract display name from email format and use it in contact mapping', () => {
			const autocompleteResponse = {
				isGroup: false,
				email: '"John Doe" <john.doe@example.com>',
				first: 'John',
				last: 'Doe',
				full: 'John Doe'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('John Doe');
			expect(result.value).toEqual(
				expect.objectContaining({
					email: 'john.doe@example.com',
					firstName: 'John',
					fullName: 'John Doe',
					id: 'john.doe@example.com',
					lastName: 'Doe',
					type: CONTACT_TYPES.CONTACT
				})
			);
		});

		it('should fallback to firstName + lastName when no display name in email format', () => {
			const autocompleteResponse = {
				isGroup: false,
				email: 'john.doe@gmail.com',
				first: 'John',
				last: 'Doe'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('John Doe');
			expect(result.value).toEqual(
				expect.objectContaining({
					email: 'john.doe@gmail.com',
					firstName: 'John',
					lastName: 'Doe',
					id: 'john.doe@gmail.com',
					type: CONTACT_TYPES.CONTACT
				})
			);
		});

		it('should handle email without quotes but with display name structure', () => {
			const autocompleteResponse = {
				isGroup: false,
				email: 'John Doe <john.doe@example.com>',
				first: 'John',
				last: 'Doe'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			// Since the regex expects quotes, this should fall back to firstName + lastName
			expect(result.label).toBe('John Doe');
		});
	});
});

const chipA = { id: 'a' };
const chipB = { id: 'b' };
const chipC = { id: 'c' };
const chipD = { id: 'd' };
const ids = (items: Array<{ id?: string }>): Array<string | undefined> => items.map((i) => i.id);

describe('insertChipAt', () => {
	it('moves a chip before the target', () => {
		expect(ids(insertChipAt([chipA, chipB, chipC], chipC, { id: 'a', side: 'before' }))).toEqual([
			'c',
			'a',
			'b'
		]);
	});

	it('moves a chip after the target', () => {
		expect(ids(insertChipAt([chipA, chipB, chipC], chipA, { id: 'b', side: 'after' }))).toEqual([
			'b',
			'a',
			'c'
		]);
	});

	it('inserts a new chip at the target', () => {
		expect(ids(insertChipAt([chipA, chipB], chipD, { id: 'b', side: 'before' }))).toEqual([
			'a',
			'd',
			'b'
		]);
	});

	it('puts the chip last without a target', () => {
		expect(ids(insertChipAt([chipA, chipB, chipC], chipA, undefined))).toEqual(['b', 'c', 'a']);
	});

	it('leaves the list unchanged when the chip is dropped on itself', () => {
		const chips = [chipA, chipB, chipC];
		expect(insertChipAt(chips, chipB, { id: 'b', side: 'after' })).toBe(chips);
	});
});

describe('findDropTarget', () => {
	const box = (id: string, left: number, top = 0): ChipBox => ({
		id,
		left,
		right: left + 100,
		top,
		bottom: top + 20
	});
	// two rows: a, b on the first one, c on the second one
	const boxes = [box('a', 0), box('b', 120), box('c', 0, 30)];

	it('targets before the first chip when the pointer is on its left half', () => {
		expect(findDropTarget(boxes, 10, 10)).toEqual({ id: 'a', side: 'before' });
	});

	it('targets before the next chip when the pointer is in the gap between two chips', () => {
		expect(findDropTarget(boxes, 110, 10)).toEqual({ id: 'b', side: 'before' });
	});

	it('targets after the last chip of the row when the pointer is past its end', () => {
		expect(findDropTarget(boxes, 400, 10)).toEqual({ id: 'b', side: 'after' });
	});

	it('targets the nearest row when the pointer is between rows or below them', () => {
		expect(findDropTarget(boxes, 400, 80)).toEqual({ id: 'c', side: 'after' });
	});

	it('has no target without chips', () => {
		expect(findDropTarget([], 10, 10)).toBeUndefined();
	});
});
