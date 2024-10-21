/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type KebabToCamelCase } from '../types';

export const CONTACTS_ROUTE = 'contacts';
export const CONTACTS_APP_ID = 'carbonio-contacts-ui';

export const ACTION_IDS = {
	editDL: 'dl-edit-action',
	expandDL: 'dl-expand-action',
	sendEmail: 'send-email-action',
	sendEmailCG: 'cg-send-email-action',
	deleteCG: 'cg-delete-action',
	editCG: 'cg-edit-action',
	copyToClipboard: 'copy-to-clipboard-action',
	addSharedAddressBooks: 'shares-add-action',
	trashAddressBook: 'trash-address-book-action',
	deleteAddressBook: 'delete-address-book-action',
	createAddressBook: 'create-address-book-action',
	moveAddressBook: 'move-address-book-action',
	editAddressBook: 'edit-address-book-action',
	emptyAddressBook: 'empty-address-book-action',
	emptyTrash: 'empty-trash-action',
	removeAddressBookLink: 'remove-address-book-link-action',
	exportAddressBook: 'export-address-book-action',
	importContacts: 'import-contacts-action',
	showShareInfo: 'show-share-info-action',
	moveContacts: 'move-contacts-action',
	restoreContacts: 'restore-contacts-action',
	trashContacts: 'trash-contacts-action',
	deleteContacts: 'delete-contacts-action',
	exportContact: 'export-contact-action'
} as const;

export const CONTACT_BOARD_ID = 'contact-board';
export const NEW_CONTACT_GROUP_BOARD_ID = 'new-contact-group-board';
export const EDIT_CONTACT_GROUP_BOARD_ID = 'edit-contact-group-board';
export const EDIT_DL_BOARD_ID = 'edit-dl-board';

export const CONTACT_GROUP_NAME_MAX_LENGTH = 256;
export const DL_NAME_MAX_LENGTH = 256;
export const GROUPS_ROUTE = 'groups';
export const ROUTES = {
	mainRoute: '/:route',
	contactGroups: '/:id?',
	distributionLists: '/:filter?/:id?'
} as const;

export type RouteParams = {
	route?: 'contact-groups' | 'distribution-lists';
	id?: string;
	filter?: 'member' | 'manager';
};

export const ROUTES_INTERNAL_PARAMS = {
	route: {
		contactGroups: 'contact-groups',
		distributionLists: 'distribution-lists'
	},
	filter: {
		member: 'member',
		manager: 'manager'
	}
} satisfies Partial<{
	[K in keyof RouteParams]: Record<
		KebabToCamelCase<NonNullable<RouteParams[K]>>,
		NonNullable<RouteParams[K]>
	>;
}>;

export const DISPLAYER_WIDTH = '60%';
export const LIST_WIDTH = '40%';
export const LIST_ITEM_HEIGHT = '4rem';
export const FIND_CONTACT_GROUP_LIMIT = 100;
export const DL_MEMBERS_LOAD_LIMIT = 100;

export const DL_TABS = {
	details: 'dl-details-tab',
	members: 'dl-members-tab',
	managers: 'dl-managers-tab'
} as const;

export const LOCAL_STORAGES = {
	EXPANDED_ADDRESSBOOKS: 'open_address_books'
};

export const TIMEOUTS = {
	defaultSnackbar: 3000,
	trashAddressBook: 5000
};

export const SEARCHED_FOLDER_STATE_STATUS = {
	empty: 'empty',
	pending: 'pending',
	complete: 'complete',
	hasMore: 'hasMore'
} as const;
