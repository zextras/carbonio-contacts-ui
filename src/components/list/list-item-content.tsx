/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Row } from '@zextras/carbonio-design-system';

export const ListItemContent = ({ children }: React.PropsWithChildren): React.JSX.Element => (
	<Row
		mainAlignment="space-around"
		crossAlignment="flex-start"
		orientation="vertical"
		padding={{ all: 'small', right: 'medium' }}
		takeAvailableSpace
	>
		{children}
	</Row>
);
