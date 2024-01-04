/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { AppLink, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { IconButton, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { noop } from 'lodash';

const folderIconName = {
	7: 'PersonOutline',
	13: 'EmailOutline',
	3: 'Trash2Outline'
};

export const CollapsedSideBarItems = ({ folder }) => {
	const folderIconColor = useMemo(
		() => (folder.color ? ZIMBRA_STANDARD_COLORS[folder.color].hex : ZIMBRA_STANDARD_COLORS[0].hex),
		[folder]
	);

	const folderIconLabel = useMemo(() => {
		if (Object.keys(folderIconName).includes(folder.id)) {
			return folderIconName[Number(folder.id)];
		}
		if (folder.id === 'shares' || folder.isShared) {
			return 'Share';
		}
		return 'Folder';
	}, [folder]);

	return (
		<>
			<AppLink to={`/folder/${folder.id}`} style={{ width: '100%', textDecoration: 'none' }}>
				<Row mainAlignment="flex-start" height={'fit'}>
					<Tooltip placement="right" label={folder.label}>
						<Padding all="extrasmall">
							<IconButton
								customSize={{ iconSize: 'large', paddingSize: 'small' }}
								icon={folderIconLabel}
								customIconColor={folderIconColor}
								onClick={noop}
							/>
						</Padding>
					</Tooltip>
				</Row>
			</AppLink>
		</>
	);
};
