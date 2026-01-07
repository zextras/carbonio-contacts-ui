/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

interface ListIconButtonProps {
	action: Action;
}
import { Action, Button, Tooltip } from '@zextras/carbonio-design-system';

export const ListActionIconButton = ({ action }: ListIconButtonProps): React.JSX.Element => (
	<Tooltip key={action.id} label={action.label}>
		<Button
			type="ghost"
			icon={action.icon}
			color={'text'}
			onClick={(ev): void => {
				ev.stopPropagation();
				action.onClick(ev);
			}}
			size={'medium'}
			disabled={action.disabled}
			data-testid={action.id}
		/>
	</Tooltip>
);
