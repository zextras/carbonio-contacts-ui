/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Icon, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Text } from './Text';

const CustomIcon = styled(Icon)`
	height: 2rem;
	width: 2rem;
`;

export const EmptyDisplayer = (): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<Container>
			<CustomIcon icon={'PeopleOutline'} color="secondary" />
			<Padding all="medium">
				<Text color="gray1" overflow="break-word" weight="bold" size="large" centered>
					{t(`displayer.title3`, 'Stay in touch with your colleagues.')}
				</Text>
			</Padding>
			<Text size="small" color="gray1" overflow="break-word" width="60%" centered>
				{t(
					`emptyDisplayer.contactGroup.hint`,
					'Click the “NEW” button to create a new contacts group.'
				)}
			</Text>
		</Container>
	);
};
