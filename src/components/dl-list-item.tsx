/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Avatar, Container } from '@zextras/carbonio-design-system';

import { ContextualMenu } from './ContextualMenu';
import { ListItemHoverBar } from './ListItemHoverBar';
import { HoverContainer, ListItemContainer } from './StyledComponents';
import { Text } from './Text';
import { LIST_ITEM_HEIGHT } from '../constants';

export type DLListItemProps = {
	onClick?: (id: string) => void;
	visible: boolean;
	id: string;
	title: string;
};

export const DLListItem = React.memo<DLListItemProps>(function DLListItemMemo({
	onClick,
	// others props
	visible,
	id,
	title
}) {
	const clickHandler = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
		onClick?.(id);
	}, [id, onClick]);

	const preventTextSelection = useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
		if (e.detail > 1) {
			e.preventDefault();
		}
	}, []);

	return (
		<Container data-testid={id} height={LIST_ITEM_HEIGHT}>
			<ContextualMenu actions={[]}>
				<ListItemContainer
					height={'fit'}
					crossAlignment={'flex-end'}
					onMouseDown={preventTextSelection}
					onClick={clickHandler}
					data-testid={'list-item-content'}
				>
					<HoverContainer
						height={LIST_ITEM_HEIGHT}
						wrap="nowrap"
						mainAlignment="flex-start"
						crossAlignment="center"
						padding={{ horizontal: 'large', vertical: 'small' }}
						width="fill"
						gap={'1rem'}
					>
						<Container
							orientation="horizontal"
							height={'auto'}
							maxHeight={'100%'}
							gap={'0.5rem'}
							width="fill"
							maxWidth={'100%'}
							mainAlignment={'flex-start'}
						>
							<Avatar
								label={title}
								icon={'DistributionListOutline'}
								size={'large'}
								shape={'square'}
							/>
							<Container crossAlignment={'flex-start'} minWidth={0}>
								<Text overflow="ellipsis" size="small">
									{title}
								</Text>
							</Container>
						</Container>
					</HoverContainer>
					<ListItemHoverBar actions={[]} />
				</ListItemContainer>
			</ContextualMenu>
		</Container>
	);
});
