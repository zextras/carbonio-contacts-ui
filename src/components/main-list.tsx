/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, ListV2, ListV2Props, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';
import { LIST_WIDTH } from '../constants';

type MainListProps = {
	onListBottom?: () => void;
	children?: ListV2Props['children'];
};

export const MainList = ({ onListBottom, children }: MainListProps): React.JSX.Element => {
	const [t] = useTranslation();
	return (
		<Container
			width={LIST_WIDTH}
			mainAlignment="flex-start"
			crossAlignment="unset"
			borderRadius="none"
			background={'gray6'}
		>
			<Row
				minHeight={'2.5rem'}
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
						{t('distribution_list.label.empty_message', 'There are no distribution lists yet.')}
					</Text>
				)}
			</Container>
		</Container>
	);
};
