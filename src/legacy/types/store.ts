/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactOrGroup, ContactsFolder } from './contact';
import { SearchedFolderStateStatus } from '../../types/utils';

export type ContactsSlice = {
	status: {
		[k: string]: boolean;
	};
	contacts: { [k: string]: Array<ContactOrGroup> };
	searchedInFolder: Record<string, SearchedFolderStateStatus>;
};

export type FoldersSlice = {
	status: string;
	folders: ContactsFolder[];
};

export type State = {
	contacts: ContactsSlice;
};
