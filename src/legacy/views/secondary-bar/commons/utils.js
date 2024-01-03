/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isEqual, transform, isObject, filter } from 'lodash';

export const ShareFolderWithOptions = (t) => [
	{
		label: t('share.options.share_calendar_with.internal_users_groups', 'Internal Users or Groups'),
		value: 'usr'
	},
	{
		label: t('share.options.share_calendar_with.external_guests', 'External guests (view only)'),
		value: '',
		disabled: true
	},
	{
		label: t(
			'share.options.share_calendar_with.public',
			'Public (view only, no password required)'
		),
		value: 'pub'
	}
];

export const ShareFolderRoleOptions = (t) => [
	{ label: t('share.none', 'None'), value: '' },
	{ label: t('share.viewer', 'Viewer'), value: 'r' },
	{
		label: t('share.admin', 'Admin'),
		value: 'rwidxa'
	},
	{
		label: t('share.manager', 'Manager'),
		value: 'rwidx'
	}
];
export const ShareCalendarRoleOptions = (t) => [
	{ label: t('share.none', 'None'), value: '' },
	{ label: t('share.viewer', 'Viewer'), value: 'r' },
	{
		label: t('share.admin', 'Admin'),
		value: 'rwidxac'
	},
	{
		label: t('share.manager', 'Manager'),
		value: 'rwidxc'
	}
];
export const differenceObject = (object, base) => {
	// eslint-disable-next-line no-shadow
	function changes(object, base) {
		return transform(object, (result, value, key) => {
			if (!isEqual(value, base[key])) {
				// eslint-disable-next-line no-param-reassign
				result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
};

export const findLabel = (list, value) => filter(list, (item) => item.value === value)[0].label;
