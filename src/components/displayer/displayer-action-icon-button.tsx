/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Action, Button, Tooltip } from '@zextras/carbonio-design-system';

interface ActionIconButtonProps {
	action: Action;
}

export const DisplayerActionIconButton: React.FC<ActionIconButtonProps> = ({ action }) => (
	<Tooltip key={action.id} label={action.label}>
		<Button
			type="ghost"
			icon={action.icon}
			color="currentColor"
			size="medium"
			onClick={(ev): void => {
				ev.stopPropagation();
				action.onClick(ev);
			}}
			disabled={action.disabled}
		/>
	</Tooltip>
);
