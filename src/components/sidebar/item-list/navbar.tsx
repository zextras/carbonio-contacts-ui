/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Row, Text } from '@zextras/carbonio-design-system';

type BreadcrumbProps = {
	name: string;
	itemsCount: number;
};

export const Navbar = ({ name, itemsCount }: BreadcrumbProps): React.JSX.Element => (
	<>
		<Container
			background="gray5"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="3rem"
		>
			<Row
				height="100%"
				width="fill"
				padding={{ all: 'small' }}
				mainAlignment="space-between"
				takeAvailableSpace
			>
				<Row
					mainAlignment="flex-start"
					takeAvailableSpace
					padding={{ all: 'small', right: 'medium' }}
				>
					<Text size="medium" data-testid="BreadcrumbPath">
						{name}
					</Text>
				</Row>
				<Row mainAlignment="flex-end" padding={{ all: 'small', right: 'medium' }}>
					<Text size="extrasmall" data-testid="BreadcrumbCount">
						{itemsCount > 100 ? '100+' : itemsCount}
					</Text>
				</Row>
			</Row>
		</Container>
		<Divider />
	</>
);
