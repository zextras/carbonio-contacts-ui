/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { SyntheticEvent, useMemo } from 'react';

import { Button, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { CONTACTS_ROUTE } from 'constants/index';

export type CollapsedSidebarItemProps = {
	id: string;
	icon: string;
	iconTooltip: string;
	redirectPath: string;
	iconColor?: string;
	isSelected?: boolean;
};
export const CollapsedSideBarItem = ({
	id,
	icon,
	iconTooltip,
	iconColor = 'text',
	redirectPath,
	isSelected
}: CollapsedSidebarItemProps): React.JSX.Element => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const active = useMemo(() => {
		if (isSelected !== undefined) {
			return isSelected;
		}
		const match =
			matchPath(`/${CONTACTS_ROUTE}/folder/:folderId/*`, pathname) ??
			matchPath(`/folder/:folderId/*`, pathname);
		return match?.params?.folderId === id;
	}, [isSelected, pathname, id]);

	const onClick = (ev: KeyboardEvent | SyntheticEvent): void => {
		ev.preventDefault();
		navigate(redirectPath, { replace: true });
	};

	return (
		<Row data-testid={`sidebar-collapsed-item-${id}`} mainAlignment="flex-start" height={'fit'}>
			<Tooltip placement="right" label={iconTooltip}>
				<Padding all="extrasmall">
					<Button
						icon={icon}
						onClick={onClick}
						backgroundColor={active ? 'highlight' : 'transparent'}
						labelColor={iconColor}
						size="extralarge"
						shape="regular"
						type="default"
					/>
				</Padding>
			</Tooltip>
		</Row>
	);
};
