/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SelectItem } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { filter } from 'lodash';

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

// TODO the permissions check is weak
export const findLabel = (list: Array<SelectItem>, value: string): string =>
	filter(list, (item) => value.includes(item.value))[0].label;
