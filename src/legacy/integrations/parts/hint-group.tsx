/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react';

import { Avatar, Container, Text } from '@zextras/carbonio-design-system';

import { UserContactGroup } from '../types';

export const HintGroup = ({ contact }: { contact: UserContactGroup }): ReactElement => {
	const label = contact.display;
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			minWidth="16rem"
			minHeight="2rem"
		>
			<Avatar label={label} />
			<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
				<Text size="large">{label}</Text>
			</Container>
		</Container>
	);
};
