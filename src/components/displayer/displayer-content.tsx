/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { PropsWithChildren } from 'react';

import { Container } from '@zextras/carbonio-design-system';

export const DisplayerContent = ({ children }: PropsWithChildren): React.JSX.Element => (
	<Container
		padding={{ horizontal: '1rem', top: '1rem', bottom: '0' }}
		crossAlignment={'flex-start'}
		mainAlignment={'flex-start'}
		gap={'1rem'}
		background={'gray6'}
		minHeight={'0'}
		height={'auto'}
	>
		{children}
	</Container>
);
