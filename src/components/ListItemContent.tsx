/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Avatar, Container, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ContextualMenu } from './ContextualMenu';
import { ListItemHoverBar } from './ListItemHoverBar';
import { HoverContainer, ListItemContainer } from './StyledComponents';
import { Text } from './Text';
import { LIST_ITEM_HEIGHT } from '../constants';
import { useActions } from '../hooks/useActions';

type ListItemContentProps = {
	id: string;
	title: string;
	members: string[];
	membersCount: number;
	visible?: boolean;
	onClick?: (id: string) => void;
};

const ContentContainer = styled(Container)`
	overflow: hidden;
`;

export const ListItemContent = React.memo<ListItemContentProps>(
	({
		onClick,
		// others props
		visible,
		id,
		title,
		membersCount,
		members
	}) => {
		const [t] = useTranslation();
		const actions = useActions({ id, title, members });

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
							<ContentContainer
								orientation="vertical"
								height={'auto'}
								maxHeight={'100%'}
								gap={'0.25rem'}
								width="fill"
								mainAlignment={'flex-start'}
							>
								<Row gap={'0.5rem'} width="fill" wrap="nowrap" mainAlignment={'flex-start'}>
									<Avatar colorLabel={title} label={title} icon={'PeopleOutline'} size={'large'} />
									<Container crossAlignment={'flex-start'} gap={'0.25rem'} minWidth={0}>
										<Text overflow="ellipsis" size="small">
											{title}
										</Text>
										<Text overflow="ellipsis" size="small" color={'gray1'}>
											{t('contactGroupList.addressCount', {
												count: membersCount,
												defaultValue: '{{count}} address',
												defaultValue_plural: `{{count}} addresses`
											})}
										</Text>
									</Container>
								</Row>
							</ContentContainer>
						</HoverContainer>
						<ListItemHoverBar actions={actions} />
					</ListItemContainer>
				</ContextualMenu>
			</Container>
		);
	}
);

ListItemContent.displayName = 'ListItemContent';
