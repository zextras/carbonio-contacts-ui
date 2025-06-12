/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Icon, Padding } from '@zextras/carbonio-design-system';

import { Text } from 'components/Text';

type EmptyDisplayerProps = {
	icon?: string;
	title: string;
	description: string;
};

export const EmptyDisplayer = ({
	title,
	description,
	icon
}: EmptyDisplayerProps): React.JSX.Element => (
	<Container>
		{icon && <Icon icon={icon} style={{ width: '2rem', height: '2rem' }} color={'secondary'} />}
		<Padding all="medium">
			<Text color="gray1" overflow="break-word" weight="bold" size="large" centered>
				{title}
			</Text>
		</Padding>
		<Text size="small" color="gray1" overflow="break-word" width="60%" centered>
			{description}
		</Text>
	</Container>
);
