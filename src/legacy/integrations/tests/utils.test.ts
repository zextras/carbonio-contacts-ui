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
	});

	describe('mapToChipContactOptions', () => {
		it('should create distribution list option with display name from autocomplete response', () => {
			const autocompleteResponse: RemoteDistributionListContact = {
				isGroup: true,
				email: '"MyDistributionList One" <mydist@demo.zextras.io>',
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
				email: 'mydist@demo.zextras.io',
				exp: false,
				full: '',
				fileas: '8:mydist@demo.zextras.io'
			};

			const result = mapToChipContactOptions(autocompleteResponse);

			expect(result.label).toBe('mydist@demo.zextras.io');
			expect(result.value).toEqual(
				expect.objectContaining({
					type: CONTACT_TYPES.DISTRIBUTION_LIST,
					email: 'mydist@demo.zextras.io',
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
});
