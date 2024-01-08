/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, Divider, IconButton } from '@zextras/carbonio-design-system';

import { Text } from './Text';
import { useActiveItem } from '../hooks/useActiveItem';

interface DisplayerHeaderProps {
	title: string;
}

export const DisplayerHeader = ({ title }: DisplayerHeaderProps): React.JSX.Element => {
	const { removeActive } = useActiveItem();

	const closeDisplayer = useCallback(() => {
		removeActive();
	}, [removeActive]);

	return (
		<Container orientation={'vertical'} width={'fill'} height={'auto'}>
			<Container
				mainAlignment={'flex-start'}
				orientation={'horizontal'}
				width={'fill'}
				height={'auto'}
				padding={{ top: '0.5rem', right: '0.5rem', bottom: '0.5rem', left: '1rem' }}
				gap={'0.5rem'}
			>
				<Text withTooltip>{title}</Text>
				<Container margin={{ left: 'auto' }} width={'fit'} height={'fit'} flexShrink={0}>
					<IconButton icon={'CloseOutline'} size={'medium'} onClick={closeDisplayer} />
				</Container>
			</Container>
			<Divider color={'gray3'} />
		</Container>
	);
};
