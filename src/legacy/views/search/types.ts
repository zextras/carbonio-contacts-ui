/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Theme } from '@zextras/carbonio-design-system';
import { ContactInputItem } from '@zextras/carbonio-ui-commons';
import { Control } from 'react-hook-form';

import { ContactOrGroup } from 'legacy/types/contact';
import { SoapContact } from 'legacy/types/soap';

export type SearchResults = {
	contacts: Array<string>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
};
export type RunSearchResults = {
	contacts: Array<ContactOrGroup>;
	more: boolean;
	offset: number;
};

export type FolderViewSearchResults = {
	more: boolean;
	offset: number;
};

export type SoapSearchResults = {
	cn: Array<SoapContact>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
};

export type SearchQueryItem = {
	id: string;
	label: string;
	value?: string;
	hasAvatar?: boolean;
	isGeneric?: boolean;
	isQueryFilter?: boolean;
};

export type Query = Array<SearchQueryItem>;

export type KeywordState = Array<{
	id: string;
	label: string;
	hasAvatar?: boolean;
	value?: string;
	isQueryFilter?: boolean;
	isGeneric?: boolean;
	avatarIcon?: string;
	avatarBackground?: string;
	hasError?: boolean;
	error?: boolean;
	fullName?: string;
	maxWidth?: string;
	background?: keyof Theme['palette'];
}>;

export type AdvancedFilterModalFormValues = {
	keywordInput: KeywordState;
	firstNameInput: KeywordState;
	lastNameInput: KeywordState;
	emailAddress: Array<ContactInputItem>;
	companyInput: KeywordState;
	jobRoleInput: KeywordState;
	phoneNumberInput: KeywordState;
	isSharedFolderIncluded: boolean;
	tagInput: KeywordState;
	folderInput: KeywordState;
};

export type FormValuesControlProps = {
	control: Control<AdvancedFilterModalFormValues>;
};

export type AdvancedFilterModalProps = {
	query: Query;
	isSharedFolderIncluded: boolean;
	onSearchConfirm: (options: { query: Query; includeSharedFolders: boolean }) => void;
	onClose: () => void;
};
