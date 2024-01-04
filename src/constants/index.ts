/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const CONTACTS_ROUTE = 'contacts';
export const CONTACTS_APP_ID = 'carbonio-contacts-ui';

export const ACTION_IDS = {
	editDL: 'dl-edit-action'
} as const;

export const NEW_CONTACT_GROUP_BOARD_ID = 'new-contact-group-board';
export const CONTACT_GROUP_NAME_MAX_LENGTH = 256;
export const GROUPS_ROUTE = 'groups';
export const ROUTES = {
	contactGroup: '/:contactGroupId?',
	contactGroups: '/',
	distributionListsMember: '/distribution-lists/member',
	distributionListsManager: '/distribution-lists/manager'
} as const;
export const DISPLAYER_WIDTH = '60%';
export const LIST_WIDTH = '40%';
export const LIST_ITEM_HEIGHT = '4rem';
export const FIND_CONTACT_GROUP_LIMIT = 100;
