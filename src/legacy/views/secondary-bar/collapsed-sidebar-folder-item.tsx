/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { t } from '@zextras/carbonio-shell-ui';

import { CollapsedSideBarItem } from './collapsed-sidebar-item';
import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { isLink } from '../../../carbonio-ui-commons/helpers/folders';
import { Folder } from '../../../carbonio-ui-commons/types';
import { getFolderTranslatedName } from '../../utils/helpers';

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

	const folderIconColor = useMemo(
		() => (folder.color ? ZIMBRA_STANDARD_COLORS[folder.color].hex : ZIMBRA_STANDARD_COLORS[0].hex),
		[folder]
	);

	const folderIconTooltip = useMemo(
		() => getFolderTranslatedName(t, folder.id, folder.name),
		[folder.id, folder.name]
	);

	return (
		<CollapsedSideBarItem
			redirectPath={`/folder/${folder.id}`}
			iconTooltip={folderIconTooltip}
			id={folder.id}
			icon={folderIcon}
			iconColor={folderIconColor}
		/>
	);
};
