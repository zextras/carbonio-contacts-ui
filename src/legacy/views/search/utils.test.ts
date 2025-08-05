/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CONTACT_TYPES } from '@zextras/carbonio-ui-commons';

import { AdvancedFilterModalFormValues } from './types';
import { getQueryToBe, getAdvancedFiltersDefaultValues } from './utils';

const FIRST_NAME_LABEL = 'FirstName:John';
const LAST_NAME_LABEL = 'LastName:Doe';
const EMAIL_LABEL = 'john@example.com';
const COMPANY_LABEL = 'Company:Acme';
const JOB_ROLE_LABEL = 'JobRole:Developer';
const PHONE_NUMBER_LABEL = 'Phone:123456';
const FOLDER_LABEL = 'in:folder';
const TAG_LABEL = 'tag:important';

describe('getQueryToBe', () => {
	const mockFormValues: AdvancedFilterModalFormValues = {
		keywordInput: [{ id: '1', label: 'keyword', value: 'test', error: false }],
		firstNameInput: [{ id: '2', label: FIRST_NAME_LABEL, value: 'John', error: false }],
		lastNameInput: [{ id: '3', label: LAST_NAME_LABEL, value: 'Doe', error: false }],
		emailAddress: [
			{
				id: 'email1',
				label: EMAIL_LABEL,
				actions: [],
				value: { id: 'email1', email: EMAIL_LABEL, type: CONTACT_TYPES.CONTACT },
				background: 'primary'
			}
		],
		companyInput: [{ id: '4', label: COMPANY_LABEL, value: 'Acme', error: false }],
		jobRoleInput: [{ id: '5', label: JOB_ROLE_LABEL, value: 'Developer', error: false }],
		phoneNumberInput: [{ id: '6', label: PHONE_NUMBER_LABEL, value: '123456', error: false }],
		folderInput: [{ id: '7', label: FOLDER_LABEL, value: 'folder', error: false }],
		tagInput: [{ id: '8', label: TAG_LABEL, value: 'important', error: false }],
		isSharedFolderIncluded: false
	};

	it('should concatenate all input arrays into single query', () => {
		const result = getQueryToBe(mockFormValues);

		expect(result).toHaveLength(9);
	});

	it('should handle empty email addresses array', () => {
		const formValues = { ...mockFormValues, emailAddress: [] };
		const result = getQueryToBe(formValues);

		expect(result).toHaveLength(8);
		expect(result.find((item) => item.label.startsWith('email:'))).toBeUndefined();
	});

	it('should handle multiple email addresses', () => {
		const formValues = {
			...mockFormValues,
			emailAddress: [
				{
					id: 'email1',
					label: EMAIL_LABEL,
					actions: [],
					value: { id: 'email1', email: EMAIL_LABEL, type: CONTACT_TYPES.CONTACT },
					background: 'primary' as const
				},
				{
					id: 'email2',
					label: 'jane@example.com',
					actions: [],
					value: { id: 'email2', email: 'jane@example.com', type: CONTACT_TYPES.CONTACT },
					background: 'secondary' as const
				}
			]
		};

		const result = getQueryToBe(formValues);
		const emailItems = result.filter((item) => item.label.startsWith('email:'));

		expect(emailItems).toHaveLength(2);
		expect(emailItems[0].value).toBe('field[email]:john@example.com');
		expect(emailItems[1].value).toBe('field[email]:jane@example.com');
	});
});

describe('getAdvancedFiltersDefaultValues', () => {
	const mockQuery = [
		{ id: '2', label: FIRST_NAME_LABEL, value: 'John', actions: [], error: false },
		{ id: '1', label: 'keyword', value: 'test', actions: [], error: false },
		{ id: '3', label: LAST_NAME_LABEL, value: 'Doe', actions: [], error: false },
		{
			id: '4',
			label: 'email:john@example.com',
			value: 'field[email]:john@example.com',
			actions: [],
			error: false
		},
		{ id: '5', label: COMPANY_LABEL, value: 'Acme', actions: [], error: false },
		{ id: '6', label: JOB_ROLE_LABEL, value: 'Developer', actions: [], error: false },
		{ id: '7', label: PHONE_NUMBER_LABEL, value: '123456', actions: [], error: false },
		{ id: '8', label: TAG_LABEL, value: 'important', actions: [], error: false },
		{ id: '9', label: FOLDER_LABEL, value: 'folder', actions: [], error: false },
		{ id: '10', label: 'has:attachment', value: 'attachment', actions: [], error: false },
		{
			id: '11',
			label: 'to:someone@example.com',
			value: 'someone@example.com',
			actions: [],
			error: false
		}
	];

	it('should return form values with correct structure', () => {
		const result = getAdvancedFiltersDefaultValues(mockQuery, false);

		expect(result).toHaveProperty('keywordInput');
		expect(result).toHaveProperty('firstNameInput');
		expect(result).toHaveProperty('lastNameInput');
		expect(result).toHaveProperty('emailAddress');
		expect(result).toHaveProperty('companyInput');
		expect(result).toHaveProperty('jobRoleInput');
		expect(result).toHaveProperty('phoneNumberInput');
		expect(result).toHaveProperty('isSharedFolderIncluded');
		expect(result).toHaveProperty('tagInput');
		expect(result).toHaveProperty('folderInput');
	});

	it('should filter items correctly for each input type', () => {
		const result = getAdvancedFiltersDefaultValues(mockQuery, false);

		expect(result.firstNameInput).toHaveLength(1);
		expect(result.firstNameInput[0].label).toBe(FIRST_NAME_LABEL);

		expect(result.lastNameInput).toHaveLength(1);
		expect(result.lastNameInput[0].label).toBe(LAST_NAME_LABEL);

		expect(result.companyInput).toHaveLength(1);
		expect(result.companyInput[0].label).toBe(COMPANY_LABEL);

		expect(result.jobRoleInput).toHaveLength(1);
		expect(result.jobRoleInput[0].label).toBe(JOB_ROLE_LABEL);

		expect(result.phoneNumberInput).toHaveLength(1);
		expect(result.phoneNumberInput[0].label).toBe(PHONE_NUMBER_LABEL);
	});

	it('should add hasAvatar and icon properties for tag and folder inputs', () => {
		const result = getAdvancedFiltersDefaultValues(mockQuery, false);

		expect(result.tagInput[0]).toEqual(
			expect.objectContaining({
				hasAvatar: true,
				icon: 'TagOutline'
			})
		);

		expect(result.folderInput[0]).toEqual(
			expect.objectContaining({
				hasAvatar: true,
				icon: 'FolderOutline'
			})
		);
	});

	it('should set isSharedFolderIncluded to provided value', () => {
		const resultFalse = getAdvancedFiltersDefaultValues(mockQuery, false);
		const resultTrue = getAdvancedFiltersDefaultValues(mockQuery, true);

		expect(resultFalse.isSharedFolderIncluded).toBe(false);
		expect(resultTrue.isSharedFolderIncluded).toBe(true);
	});

	it('should handle empty query array', () => {
		const result = getAdvancedFiltersDefaultValues([], false);

		expect(result.keywordInput).toEqual([]);
		expect(result.firstNameInput).toEqual([]);
		expect(result.lastNameInput).toEqual([]);
		expect(result.emailAddress).toEqual([]);
		expect(result.companyInput).toEqual([]);
		expect(result.jobRoleInput).toEqual([]);
		expect(result.phoneNumberInput).toEqual([]);
		expect(result.tagInput).toEqual([]);
		expect(result.folderInput).toEqual([]);
		expect(result.isSharedFolderIncluded).toBe(false);
	});

	it('should transform email items to ContactInputItem format', () => {
		const result = getAdvancedFiltersDefaultValues(mockQuery, false);

		expect(result.emailAddress).toHaveLength(1);
		expect(result.emailAddress[0]).toEqual({
			id: EMAIL_LABEL,
			label: EMAIL_LABEL,
			value: {
				id: EMAIL_LABEL,
				email: EMAIL_LABEL,
				type: CONTACT_TYPES.CONTACT
			}
		});
	});
});
