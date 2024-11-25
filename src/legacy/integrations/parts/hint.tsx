/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react';

import { Avatar, Container, Row, Text } from '@zextras/carbonio-design-system';

export const Hint = ({ email, label }: { email: string; label: string }): ReactElement => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<Avatar label={label} />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Text size="large">{label}</Text>
			</Row>
			<Row takeAvailableSpace mainAlignment="flex-start">
				<Text color="secondary">{email}</Text>
			</Row>
		</Container>
	</Container>
);
