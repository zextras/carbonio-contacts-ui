/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SoapContact } from '../../types/soap';

export type SearchResults = {
	contacts: Array<string>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
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
