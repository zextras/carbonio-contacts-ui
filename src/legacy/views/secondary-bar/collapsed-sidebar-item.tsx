/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { SyntheticEvent } from 'react';

import { Button, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

type CollapsedSidebarItemProps = {
	id: string;
	icon: string;
	iconTooltip: string;
	redirectPath: string;
	iconColor?: string;
};
export const CollapsedSideBarItem = ({
	id,
	icon,
	iconTooltip,
	iconColor = 'text',
	redirectPath
}: CollapsedSidebarItemProps): React.JSX.Element => {
	const replaceHistory = useReplaceHistoryCallback();
	const onClick = (ev: KeyboardEvent | SyntheticEvent): void => {
		ev.preventDefault();
		replaceHistory(redirectPath);
	};

	return (
		<Row data-testid={`sidebar-collapsed-item-${id}`} mainAlignment="flex-start" height={'fit'}>
			<Tooltip placement="right" label={iconTooltip}>
				<Padding all="extrasmall">
					<Button
						icon={icon}
						onClick={onClick}
						backgroundColor={'transparent'}
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
