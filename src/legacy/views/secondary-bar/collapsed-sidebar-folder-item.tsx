/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { IconButton, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { AppLink, t } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';

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
		<AppLink to={`/folder/${folder.id}`} style={{ width: '100%', textDecoration: 'none' }}>
			<Row mainAlignment="flex-start" height={'fit'}>
				<Tooltip placement="right" label={folderIconTooltip}>
					<Padding all="extrasmall">
						<IconButton
							customSize={{ iconSize: 'large', paddingSize: 'small' }}
							icon={folderIcon}
							iconColor={folderIconColor}
							onClick={noop}
						/>
					</Padding>
				</Tooltip>
			</Row>
		</AppLink>
	);
};
