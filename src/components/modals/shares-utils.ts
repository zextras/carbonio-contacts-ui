/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SelectItem } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { find } from 'lodash';

const ROLES = {
	none: {
		name: 'None',
		key: 'share.none',
		flags: '',
		regex: '^$'
	},
	viewer: {
		name: 'Viewer',
		key: 'share.viewer',
		flags: 'r',
		regex: `^r$`
	},
	admin: {
		name: 'Admin',
		key: 'share.admin',
		flags: 'rwidxa',
		regex: `^rwidxa[c]?$`
	},
	manager: {
		name: 'Manager',
		key: 'share.manager',
		flags: 'rwidx',
		regex: `^rwidx[c]?$`
	}
};

export const getShareFolderRoleOptions = (t: TFunction): Array<SelectItem> =>
	Object.values(ROLES).map((role) => ({
		label: t(role.key, role.name),
		value: role.flags
	}));

export const getRoleDescription = (permissionsFlags: string, t: TFunction): string => {
	let role = find(ROLES, (role): boolean => permissionsFlags.match(role.regex) !== null);
	if (!role) {
		role = ROLES.none;
	}

	return t(role.key, role.name);
};
