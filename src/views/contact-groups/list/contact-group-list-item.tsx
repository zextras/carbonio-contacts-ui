/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Action, Container, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ContextualMenu } from '../../../components/contextual-menu';
import { ListItemHoverBar } from '../../../components/ListItemHoverBar';
import {
	CustomIconAvatar,
	HoverContainer,
	ListItemContainer
} from '../../../components/styled-components';
import { Text } from '../../../components/Text';
import { LIST_ITEM_HEIGHT } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';

type CGListItemProps = {
	contactGroup: ContactGroup;
	visible?: boolean;
	onClick?: (id: string) => void;
	actions: Action[];
};

const ContentContainer = styled(Container)`
	overflow: hidden;
`;

export const ContactGroupListItem = React.memo<CGListItemProps>(
	({ onClick, visible, contactGroup, actions }) => {
		const [t] = useTranslation();
		const { id, title, members } = contactGroup;

		const clickHandler = useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
			onClick?.(id);
		}, [id, onClick]);

		const preventTextSelection = useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
			if (e.detail > 1) {
				e.preventDefault();
			}
		}, []);

		return (
			<Container data-testid={id} height={LIST_ITEM_HEIGHT} id={id}>
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
									<CustomIconAvatar label={title} icon={'PeopleOutline'} size={'large'} />
									<Container crossAlignment={'flex-start'} gap={'0.25rem'} minWidth={0}>
										<Text overflow="ellipsis" size="small">
											{title}
										</Text>
										<Text overflow="ellipsis" size="small" color={'gray1'}>
											{t('contactGroupList.addressCount', {
												count: members.length,
												defaultValue_one: '{{count}} address',
												defaultValue_other: `{{count}} addresses`
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

ContactGroupListItem.displayName = 'CgListItem';
