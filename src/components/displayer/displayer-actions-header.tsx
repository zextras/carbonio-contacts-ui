/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

export const DisplayerActionsHeader = ({
	children,
	...rest
}: React.PropsWithChildren): React.JSX.Element => (
	<Container
		orientation={'horizontal'}
		height={'auto'}
		padding={{ vertical: '0.5rem' }}
		gap={'0.25rem'}
		mainAlignment={'flex-end'}
		{...rest}
	>
		{children}
	</Container>
);
