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
import { ListActionIconButton } from '../../../components/list-action-icon-button';
import { CustomIconAvatar, HoverRow } from '../../../components/styled-components';
import { Text } from '../../../components/Text';
import { ContactGroup } from '../../../model/contact-group';

type CGListItemProps = {
	contactGroup: ContactGroup;
	onClick?: (id: string) => void;
	actions: Action[];
};

const HoverBarContainer = styled(Container)`
	top: 0;
	right: 0;
	display: none;
	position: absolute;
	background: linear-gradient(
		to right,
		transparent,
		${({ theme }): string => theme.palette.gray6.hover}
	);
	height: 55%;
	& > * {
		margin-top: ${({ theme }): string => theme.sizes.padding.small};
		margin-right: ${({ theme }): string => theme.sizes.padding.small};
	}
`;

const CustomHoverRow = styled(HoverRow)`
	&:hover {
		background: ${({ theme }): string => theme.palette.gray6.hover};
		& ${HoverBarContainer} {
			display: flex;
		}
	}
`;

export const ContactGroupListItem = React.memo<CGListItemProps>(
	({ onClick, contactGroup, actions }) => {
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
			<Container orientation="vertical" data-testid={`contact-group-list-item-${id}`}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<ContextualMenu
						actions={actions}
						data-testid={`contact-group-list-item-contextual-menu-${id}`}
					>
						<CustomHoverRow
							orientation="horizontal"
							mainAlignment="flex-start"
							crossAlignment="unset"
							onClick={clickHandler}
							onMouseDown={preventTextSelection}
						>
							<Row
								gap={'0.5rem'}
								width="fill"
								wrap="nowrap"
								mainAlignment={'flex-start'}
								padding={{ all: 'small' }}
							>
								<CustomIconAvatar label={title} icon={'PeopleOutline'} size={'large'} />
								<Container
									crossAlignment={'flex-start'}
									gap={'0.25rem'}
									minWidth={0}
									padding={{ left: 'small', right: 'small' }}
								>
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
							<HoverBarContainer
								orientation="horizontal"
								mainAlignment="flex-end"
								crossAlignment="center"
								padding={{ right: 'small' }}
							>
								{actions.map((action) => (
									<ListActionIconButton key={action.id} action={action} />
								))}
							</HoverBarContainer>
						</CustomHoverRow>
					</ContextualMenu>
				</Container>
			</Container>
		);
	}
);

ContactGroupListItem.displayName = 'CgListItem';
