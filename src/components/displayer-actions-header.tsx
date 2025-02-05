/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { type Action, Button, Container, Tooltip } from '@zextras/carbonio-design-system';

interface DisplayerActionsHeaderProps {
	actions: Action[];
}

export const DisplayerActionsHeader = ({
	actions
}: DisplayerActionsHeaderProps): React.JSX.Element => {
	const actionButtons = useMemo<React.JSX.Element[]>(
		() =>
			actions.map((action) => (
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
			)),
		[actions]
	);

	return (
		<Container
			orientation={'horizontal'}
			height={'auto'}
			padding={{ vertical: '0.5rem' }}
			gap={'0.25rem'}
			mainAlignment={'flex-end'}
		>
			{actionButtons}
		</Container>
	);
};
