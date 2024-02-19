/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo, useState } from 'react';

import { TabBarProps } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DL_TABS } from '../constants';

type UseDLTabsReturnType = {
	items: TabBarProps['items'];
	selected: string;
	onChange: TabBarProps['onChange'];
};

export const useDLTabs = (): UseDLTabsReturnType => {
	const [t] = useTranslation();
	const [selected, setSelected] = useState<string>(DL_TABS.details);

	const items = useMemo(
		(): TabBarProps['items'] => [
			{ id: DL_TABS.details, label: t('distribution_list.tabs.details', 'Details') },
			{ id: DL_TABS.members, label: t('distribution_list.tabs.members', 'Member list') },
			{
				id: DL_TABS.managers,
				label: t('distribution_list.tabs.managers', 'Manager list')
			}
		],
		[t]
	);

	const onChange = useCallback<TabBarProps['onChange']>((ev, selectedId) => {
		setSelected(selectedId);
	}, []);

	return { items, selected, onChange };
};
