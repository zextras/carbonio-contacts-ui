/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Row, Shimmer } from '@zextras/carbonio-design-system';

export const ShimmedDisplayerListItem = (): React.JSX.Element => (
	<Row
		width={'fill'}
		mainAlignment={'space-between'}
		padding={'small'}
		gap={'0.5rem'}
		data-testid={'member-list-item'}
		wrap={'nowrap'}
	>
		<Row wrap={'nowrap'} gap={'0.5rem'} flexShrink={1} minWidth={'1rem'}>
			<Row flexShrink={0}>
				<Shimmer.Avatar size={'medium'} />
			</Row>
			<Row flexShrink={1} minWidth={'1rem'}>
				<Shimmer.Text size="small" width="25ch" />
			</Row>
		</Row>
	</Row>
);
