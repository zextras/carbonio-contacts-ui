/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Action as DSAction, Container } from '@zextras/carbonio-design-system';

import { ContextualMenu } from './contextual-menu';
import { ListItemHoverBar } from './ListItemHoverBar';
import { CustomIconAvatar, HoverContainer, ListItemContainer } from './styled-components';
import { Text } from './Text';
import { LIST_ITEM_HEIGHT } from '../constants';
import { useDLActions } from '../hooks/use-dl-actions';
import { DistributionList } from '../model/distribution-list';

type DLListItemContentProps = {
	onClick?: (id: string) => void;
	id: string;
	title: string;
	actions: Array<DSAction>;
};

const DLListItemContent = React.memo<DLListItemContentProps>(function DLListItemMemo({
	onClick,
	// others props
	id,
	title,
	actions
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
			<ContextualMenu actions={actions}>
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
							<CustomIconAvatar
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
					<ListItemHoverBar actions={actions} height={'fill'} crossAlignment={'flex-start'} />
				</ListItemContainer>
			</ContextualMenu>
		</Container>
	);
});

type DLListItemProps = {
	distributionList: DistributionList;
	visible: boolean;
	onClick?: (id: string) => void;
};

export const DLListItem = ({
	distributionList,
	visible,
	onClick
}: DLListItemProps): React.JSX.Element => {
	const actions = useDLActions(distributionList);
	return (
		<DLListItemContent
			id={distributionList.id}
			title={distributionList.displayName || distributionList.email}
			actions={actions}
			onClick={onClick}
		/>
	);
};
