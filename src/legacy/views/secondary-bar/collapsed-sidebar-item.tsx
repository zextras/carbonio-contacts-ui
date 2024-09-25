/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { SyntheticEvent } from 'react';

import { Button, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

type CollapsedSidebarItemProps = {
	icon: string;
	iconTooltip: string;
	redirectPath: string;
};
export const CollapsedSideBarItem = ({
	icon,
	iconTooltip,
	redirectPath
}: CollapsedSidebarItemProps): React.JSX.Element => {
	const replaceHistory = useReplaceHistoryCallback();
	const onClick = (ev: KeyboardEvent | SyntheticEvent): void => {
		ev.preventDefault();
		replaceHistory(redirectPath);
	};

	return (
		<Row mainAlignment="flex-start" height={'fit'}>
			<Tooltip placement="right" label={iconTooltip}>
				<Padding all="extrasmall">
					<Button
						icon={'PersonOutline'}
						onClick={onClick}
						backgroundColor={'transparent'}
						labelColor={'text'}
						size="extralarge"
						shape="regular"
						type="default"
					/>
				</Padding>
			</Tooltip>
		</Row>
	);
};
