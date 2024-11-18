/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Contact, ContactsFolder } from './contact';
import { SoapContact } from './soap';
import { SearchedFolderStateStatus } from '../../types/utils';

export type ContactsSlice = {
	status: {
		[k: string]: boolean;
	};
	contacts: { [k: string]: Array<Contact> };
	searchedInFolder: Record<string, SearchedFolderStateStatus>;
};

export type SyncSlice = {
	status: string;
	intervalId: number;
	token: string | undefined;
};

export type FoldersSlice = {
	status: string;
	folders: ContactsFolder[];
};

export type State = {
	contacts: ContactsSlice;
};

export type ModifyContactAction = {
	meta: {
		arg: {
			editContact: Contact;
			updatedContact: Contact;
		};
		requestId: string;
	};
};

export type AddContactRequest = {
	meta: {
		arg: Contact;
		requestId: string;
	};
};

export type AddContactAction = AddContactRequest & {
	payload: SoapContact[];
};

export type DeleteContactAction = {
	meta: {
		arg: {
			contact: Contact;
			parent: string;
		};
		requestId: string;
	};
};

export type GetContactAction = {
	payload: SoapContact[];
};

export type FetchContactsByFolderId = {
	payload: {
		contacts: Contact[];
		folderId: string;
	};
};
