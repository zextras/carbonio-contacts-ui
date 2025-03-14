/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactOrGroup } from '../../types/contact';

export type SearchResults = {
	contacts: Array<ContactOrGroup>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
};
