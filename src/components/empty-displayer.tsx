/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Icon, Padding } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { Text } from './Text';

type EmptyDisplayerProps = {
	icon?: string;
	title: string;
	description: string;
};

const CustomIcon = styled(Icon)`
	width: 2rem;
	height: 2rem;
`;

export const EmptyDisplayer = ({
	title,
	description,
	icon
}: EmptyDisplayerProps): React.JSX.Element => (
	<Container>
		{icon && <CustomIcon icon={icon} color={'secondary'} />}
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
