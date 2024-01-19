/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, ListV2, ListV2Props, Row } from '@zextras/carbonio-design-system';

import { Text } from './Text';
import { LIST_WIDTH } from '../constants';

type MainListProps = {
	onListBottom?: () => void;
	children?: ListV2Props['children'];
	emptyMessage: string;
};

export const MainList = ({
	onListBottom,
	children,
	emptyMessage
}: MainListProps): React.JSX.Element => (
	<Container
		width={LIST_WIDTH}
		mainAlignment="flex-start"
		crossAlignment="unset"
		borderRadius="none"
		background={'gray6'}
		borderColor={{ right: 'gray3' }}
	>
		<Row
			minHeight={'3rem'}
			height="auto"
			background={'gray5'}
			mainAlignment={'space-between'}
			padding={{ left: 'large' }}
			wrap={'nowrap'}
			width={'fill'}
			maxWidth={'100%'}
			data-testid="list-header"
			flexShrink={0}
			flexGrow={1}
			gap="medium"
		></Row>
		<Divider color="gray3" />
		<Container minHeight={0} maxHeight={'100%'}>
			{children && children.length > 0 ? (
				<ListV2 data-testid="main-list" background={'gray6'} onListBottom={onListBottom}>
					{children}
				</ListV2>
			) : (
				<Text size={'small'} weight={'bold'} overflow={'break-word'} color={'secondary'} centered>
					{emptyMessage}
				</Text>
			)}
		</Container>
	</Container>
);
