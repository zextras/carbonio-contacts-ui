/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { type Action, Button, Container } from '@zextras/carbonio-design-system';

interface ActionsHeaderProps {
	actions: Action[];
}
export const ActionsHeader = ({ actions }: ActionsHeaderProps): React.JSX.Element => {
	const actionButtons = useMemo<React.JSX.Element[]>(
		() =>
			actions.map((action) => (
				<Button
					key={action.id}
					label={action.label}
					type={'outlined'}
					onClick={action.onClick}
					size={'medium'}
					backgroundColor={'transparent'}
					disabled={action.disabled}
					color={action.color}
				/>
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
