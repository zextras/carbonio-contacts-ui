/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CONTACT_TYPES } from '@zextras/carbonio-ui-commons';

import { getContactLabel, mapToChipContactOptions } from 'legacy/integrations/parts/utils';
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

		// New tests for displayName priority logic
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

		it('should include middle name in firstName + lastName fallback', () => {
			const personContact = {
				id: '12346546',
				email: 'john.poe@example.com',
				firstName: 'John',
				middleName: 'Michael',
				lastName: 'Poe',
				type: CONTACT_TYPES.CONTACT
			};

			const label = getContactLabel(personContact);

			expect(label).toBe('John Michael Poe');
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
