/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Action, Container } from '@zextras/carbonio-design-system';

import { DisplayerActionsHeader } from '../displayer-actions-header';
import { DisplayerHeader } from '../displayer-header';

type DisplayerProps = {
	title: string;
	icon: string;
	onClose: () => void;
	actions: Array<Action>;
	children?: React.JSX.Element;
};

export const Displayer = ({
	children,
	icon,
	title,
	onClose,
	actions
}: DisplayerProps): React.JSX.Element => (
	<Container
		orientation="vertical"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		data-testid="displayer"
	>
		<Container
			background={'gray5'}
			mainAlignment={'flex-start'}
			padding={{ bottom: '3rem' }}
			data-testid={'displayer'}
		>
			<DisplayerHeader title={title} icon={icon} closeDisplayer={onClose} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				<DisplayerActionsHeader actions={actions} />
				{children}
			</Container>
		</Container>
	</Container>
);
