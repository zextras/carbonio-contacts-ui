/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CONTACT_TYPES, ContactInputItem } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';
import { concat, filter, map } from 'lodash';

import {
	AdvancedFilterModalFormValues,
	KeywordState,
	Query,
	SearchQueryItem
} from 'legacy/views/search/types';

const excludeLabels = ['has:attachment', 'is:flagged', 'is:unread'];
const emailFilterPrefix = 'field[email]:';
const emailFilterLabelPrefix = 'email:';
const excludePrefixes = ['to:', 'from:'];

export const EmptyListMessages = (
	t: TFunction<'translation', undefined, 'translation'>
): Array<{ title: string; description: string }> => [
	{
		title: t('displayer.search_title1', 'Start another search'),
		description: t(
			'displayer.search_description1',
			'Or select “Advanced Filters” to refine your search.'
		)
	},
	{
		title: t('displayer.search_title2', 'We’re sorry but there are no results for your search'),
		description: t('displayer.search_description2', 'Try to start another search.')
	},
	{
		title: t('displayer.search_title3', 'There are no results for your search.'),
		description: t(
			'displayer.search_description3',
			`Check the spelling and the filters' options or try with another keyword.`
		)
	}
];

export const EmptyFieldMessages = (
	t: TFunction<'translation', undefined, 'translation'>
): Array<{ title: string; description: string }> => [
	{
		title: t(
			'displayer.search_title4',
			'Select one or more results to perform actions or display details.'
		),
		description: ''
	}
];

export function getQueryToBe(formValues: AdvancedFilterModalFormValues): Query {
	const {
		keywordInput,
		firstNameInput,
		lastNameInput,
		emailAddress,
		companyInput,
		jobRoleInput,
		phoneNumberInput,
		folderInput,
		tagInput
	} = formValues;

	return concat(
		keywordInput,
		firstNameInput,
		lastNameInput,
		emailAddress.map((item) => ({
			...item,
			id: item.value.email,
			label: `${emailFilterLabelPrefix}${item.value.email}` || item.value.email,
			actions: [],
			value: `${emailFilterPrefix}${item.value.email}`,
			avatarBackground: item.background,
			error: false,
			isQueryFilter: true
		})),
		companyInput,
		jobRoleInput,
		phoneNumberInput,
		folderInput,
		tagInput
	);
}

function toContactInput(item: SearchQueryItem): ContactInputItem {
	const email = item.value?.replace(emailFilterPrefix, '') ?? '';
	return {
		id: email,
		label: item.label.replace(emailFilterLabelPrefix, '') ?? email,
		value: {
			id: email,
			email,
			type: CONTACT_TYPES.CONTACT
		}
	};
}

function getOtherKeywordsDefaultValue(query: Query): KeywordState {
	return map(
		filter(query, (queryItem) => {
			const isExcluded =
				excludeLabels.includes(queryItem.label) ||
				excludePrefixes.some((prefix) => queryItem.label.startsWith(prefix)) ||
				queryItem.isQueryFilter ||
				'queryChipsToAdvancedFiltersValue' in queryItem;

			return !isExcluded;
		}),
		(q) => ({ ...q, hasAvatar: false })
	);
}

function getFirstNameInputDefaultValue(query: Query): KeywordState {
	return filter(query, (queryItem) => queryItem.label.startsWith('FirstName:'));
}

function getLastNameInputDefaultValue(query: Query): KeywordState {
	return filter(query, (queryItem) => queryItem.label.startsWith('LastName:'));
}

function getEmailDefaultValue(query: Query): Array<ContactInputItem> {
	return filter(query, (queryItem) => queryItem.label.startsWith('email:')).map((item) =>
		toContactInput(item)
	);
}

function getCompanyInputDefaultValue(query: Query): KeywordState {
	return filter(query, (queryItem) => queryItem.label.startsWith('Company:'));
}

function getJobRoleInputDefaultValue(query: Query): KeywordState {
	return filter(query, (queryItem) => queryItem.label.startsWith('JobRole:'));
}

function getPhoneNumberInputDefaultValue(query: Query): KeywordState {
	return filter(query, (queryItem) => queryItem.label.startsWith('Phone:'));
}

function getTagInQueryDefaultValue(query: Query): KeywordState {
	return query
		.filter((v) => v.label.startsWith('tag:'))
		.map((q) => ({ ...q, hasAvatar: true, icon: 'TagOutline' }));
}

function getFolderInQueryDefaultValue(query: Query): KeywordState {
	return map(
		filter(query, (v) => v.label.startsWith('in:')),
		(q) => ({
			...q,
			hasAvatar: true,
			icon: 'FolderOutline'
		})
	);
}

export function getAdvancedFiltersDefaultValues(
	query: Query,
	isSharedFolderIncluded: boolean
): AdvancedFilterModalFormValues {
	return {
		keywordInput: getOtherKeywordsDefaultValue(query),
		firstNameInput: getFirstNameInputDefaultValue(query),
		lastNameInput: getLastNameInputDefaultValue(query),
		emailAddress: getEmailDefaultValue(query),
		companyInput: getCompanyInputDefaultValue(query),
		jobRoleInput: getJobRoleInputDefaultValue(query),
		phoneNumberInput: getPhoneNumberInputDefaultValue(query),
		isSharedFolderIncluded,
		tagInput: getTagInQueryDefaultValue(query),
		folderInput: getFolderInQueryDefaultValue(query)
	};
}
