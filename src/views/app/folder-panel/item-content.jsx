/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Text, Row, Tooltip } from '@zextras/carbonio-design-system';
import React, { useMemo } from 'react';
import { trim } from 'lodash';
import { useDisplayName } from '../../../commons/use-display-name';

export const ItemContent = ({ item }) => {
	const displayName = useDisplayName(item);
	const secondaryRow = useMemo(
		() =>
			trim(
				`${Object.values(item.email).length > 0 ? Object.values(item.email)[0].mail : ''}, ${
					Object.values(item.phone).length > 0 ? Object.values(item.phone)[0].number : ''
				}`,
				', '
			),
		[item]
	);
	return (
		<Row
			mainAlignment="space-around"
			crossAlignment="flex-start"
			orientation="vertical"
			padding={{ all: 'small', right: 'medium' }}
			takeAvailableSpace
		>
			<Text data-testid="SenderText" size="small" weight="regular" overflow="ellipsis">
				{displayName}
			</Text>
			<Tooltip label={secondaryRow} overflow="break-word" maxWidth="60vw">
				<Text
					data-testid="SenderSecondText"
					color="secondary"
					size="small"
					weight="regular"
					overflow="ellipsis"
				>
					{secondaryRow}
				</Text>
			</Tooltip>
		</Row>
	);
};
