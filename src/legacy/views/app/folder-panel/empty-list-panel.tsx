/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';

export const EmptyListPanel = ({
	emptyListTitle
}: {
	emptyListTitle: string;
}): React.JSX.Element => (
	<Container data-testid="ContactsListToScrollContainer" crossAlignment="unset">
		<Text
			color="gray1"
			overflow="break-word"
			size="small"
			style={{ whiteSpace: 'pre-line', textAlign: 'center', paddingTop: '2rem' }}
		>
			{emptyListTitle}
		</Text>
	</Container>
);
