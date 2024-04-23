/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SelectItem } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { filter } from 'lodash';

export const getShareFolderWithOptions = (t: TFunction): Array<SelectItem> => [
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

export const getShareFolderRoleOptions = (t: TFunction): Array<SelectItem> => [
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

export const findLabel = (list: Array<SelectItem>, value: string): string =>
	filter(list, (item) => item.value === value)[0].label;
