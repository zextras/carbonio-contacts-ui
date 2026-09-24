/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { t } from '@zextras/carbonio-shell-ui';
import { isLink, Folder, resolveFolderColorHex } from '@zextras/carbonio-ui-commons';

import { CONTACTS_ROUTE } from 'constants/index';
import { getFolderTranslatedName } from 'legacy/utils/helpers';
import { CollapsedSideBarItem } from 'legacy/views/secondary-bar/collapsed-sidebar-item';

const folderIconName: Record<number, string> = {
	7: 'PersonOutline',
	13: 'EmailOutline',
	3: 'Trash2Outline'
};

export const CollapsedSideBarFolderItem = ({ folder }: { folder: Folder }): React.JSX.Element => {
	const folderIcon = useMemo(() => {
		if (Object.keys(folderIconName).includes(folder.id)) {
			return folderIconName[Number(folder.id)];
		}
		if (folder.id === 'shares' || isLink(folder)) {
			return 'Share';
		}
		return 'Folder';
	}, [folder]);

	const folderIconColor = useMemo(() => resolveFolderColorHex(folder.color, folder.rgb), [folder]);

	const folderIconTooltip = useMemo(
		() => getFolderTranslatedName(t, folder.id, folder.name),
		[folder.id, folder.name]
	);

	return (
		<CollapsedSideBarItem
			redirectPath={`/${CONTACTS_ROUTE}/folder/${folder.id}`}
			iconTooltip={folderIconTooltip}
			id={folder.id}
			icon={folderIcon}
			iconColor={folderIconColor}
		/>
	);
};
