/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { KebabToCamelCase } from '../types/utils';

export const CONTACTS_ROUTE = 'contacts';
export const CONTACTS_APP_ID = 'carbonio-contacts-ui';

export const ACTION_IDS = {
	editDL: 'dl-edit-action',
	sendEmail: 'send-email-action'
} as const;

export const NEW_CONTACT_GROUP_BOARD_ID = 'new-contact-group-board';
export const CONTACT_GROUP_NAME_MAX_LENGTH = 256;
export const GROUPS_ROUTE = 'groups';
export const ROUTES = {
	mainRoute: '/:route',
	contactGroups: '/:id?',
	distributionLists: '/:filter/:id?'
} as const;

export type RouteParams = {
	route: 'contact-groups' | 'distribution-lists';
	id: string;
	filter: 'member' | 'manager';
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
	[K in keyof RouteParams]: Record<KebabToCamelCase<RouteParams[K]>, RouteParams[K]>;
}>;

export const DISPLAYER_WIDTH = '60%';
export const LIST_WIDTH = '40%';
export const LIST_ITEM_HEIGHT = '4rem';
export const FIND_CONTACT_GROUP_LIMIT = 100;
