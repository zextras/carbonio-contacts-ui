/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

interface ListIconButtonProps {
	action: Action;
}
import { Action, IconButton, Tooltip } from '@zextras/carbonio-design-system';

export const ListActionIconButton = ({ action }: ListIconButtonProps): React.JSX.Element => (
	<Tooltip key={action.id} label={action.label}>
		<IconButton
			icon={action.icon as string}
			onClick={(ev): void => {
				ev.stopPropagation();
				action.onClick(ev);
			}}
			size="small"
			disabled={action.disabled}
		/>
	</Tooltip>
);
