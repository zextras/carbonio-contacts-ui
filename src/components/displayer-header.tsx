/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Icon, IconButton } from '@zextras/carbonio-design-system';
import styled, { DefaultTheme } from 'styled-components';

import { Text } from './Text';

interface DisplayerHeaderProps {
	title: string;
	icon: keyof DefaultTheme['icons'];
	closeDisplayer?: () => void;
}

const CustomIcon = styled(Icon)`
	width: 1.125rem;
	height: 1.125rem;
`;

export const DisplayerHeader = ({
	title,
	icon,
	closeDisplayer
}: DisplayerHeaderProps): React.JSX.Element => (
	<Container
		orientation={'vertical'}
		width={'fill'}
		height={'auto'}
		data-testid={'displayer-header'}
	>
		<Container
			mainAlignment={'flex-start'}
			orientation={'horizontal'}
			width={'fill'}
			height={'auto'}
			padding={{ top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '1rem' }}
			gap={'0.75rem'}
		>
			<Container
				width={'fit-content'}
				height={'fit-content'}
				minWidth={'fit-content'}
				minHeight={'fit-content'}
			>
				<CustomIcon icon={icon} />
			</Container>
			<Text withTooltip>{title}</Text>
			<Container margin={{ left: 'auto' }} width={'fit'} height={'fit'} flexShrink={0}>
				{closeDisplayer && (
					<IconButton icon={'CloseOutline'} size={'medium'} onClick={closeDisplayer} />
				)}
			</Container>
		</Container>
		<Divider color={'gray3'} />
	</Container>
);
