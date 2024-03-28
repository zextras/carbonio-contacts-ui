/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Text, Row, Tooltip, Container, Padding, Icon } from '@zextras/carbonio-design-system';
import { trim } from 'lodash';

import { useDisplayName } from '../../../hooks/use-display-name';
import { useTagExist } from '../../../ui-actions/tag-actions';

export const RowInfo = ({ item, tags }) => {
	const tagIcon = useMemo(() => (tags?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);
	const tagIconColor = useMemo(() => (tags?.length === 1 ? tags?.[0]?.color : undefined), [tags]);

	const isTagInStore = useTagExist(tags);
	const showTagIcon = useMemo(
		() => item.tags && item.tags.length !== 0 && item.tags?.[0] !== '' && isTagInStore,
		[isTagInStore, item.tags]
	);

	return (
		<Row>
			{showTagIcon && (
				<Padding left="small">
					<Icon data-testid="TagIcon" icon={tagIcon} color={tagIconColor} />
				</Padding>
			)}
		</Row>
	);
};

export const ItemContent = ({ item, tags }) => {
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
			<Container orientation="horizontal" height="fit" width="fill">
				<Row wrap="nowrap" takeAvailableSpace mainAlignment="flex-start">
					<Text>{displayName}</Text>
				</Row>
				<RowInfo item={item} tags={tags} />
			</Container>
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
