/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

export const ModalWrapper = ({ children }: React.PropsWithChildren): React.JSX.Element => (
	<Container
		padding={{ all: 'large' }}
		mainAlignment="center"
		crossAlignment="flex-start"
		height="100%"
		style={{
			overflowY: 'auto'
		}}
	>
		{children}
	</Container>
);
