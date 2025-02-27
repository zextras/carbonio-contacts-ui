/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { DisplayerHeader } from '../displayer-header';

type DisplayerProps = React.PropsWithChildren & {
	title: string;
	icon: string;
	onClose: () => void;
};

export const Displayer = ({
	children,
	icon,
	title,
	onClose,
	...rest
}: DisplayerProps): React.JSX.Element => (
	<Container
		orientation="vertical"
		mainAlignment="flex-start"
		crossAlignment="flex-start"
		data-testid="displayer"
		{...rest}
	>
		<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '3rem' }}>
			<DisplayerHeader title={title} icon={icon} closeDisplayer={onClose} />
			<Container
				padding={{ horizontal: '1rem' }}
				mainAlignment={'flex-start'}
				minHeight={0}
				maxHeight={'100%'}
			>
				{children}
			</Container>
		</Container>
	</Container>
);
