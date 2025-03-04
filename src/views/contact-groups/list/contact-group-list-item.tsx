/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Action, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ListActionIconButton } from '../../../components/list/list-action-icon-button';
import { ListItemActionsWrapper } from '../../../components/list/list-item-actions-wrapper';
import { ListItemAvatar } from '../../../components/list/list-item-avatar';
import { ListItemContent } from '../../../components/list/list-item-content';
import { Text } from '../../../components/Text';
import { ContactGroup } from '../../../model/contact-group';

type CGListItemProps = {
	contactGroup: ContactGroup;
	onClick?: (id: string) => void;
	actions: Action[];
};

export const ContactGroupListItem = React.memo<CGListItemProps>(
	({ onClick, contactGroup, actions }) => {
		const [t] = useTranslation();
		const { id, title, members } = contactGroup;
		const clickHandler = useCallback(() => {
			onClick?.(id);
		}, [id, onClick]);

		const avatar = {
			id: contactGroup.id,
			label: contactGroup.title,
			icon: 'PeopleOutline'
		};
		const hoverActions = actions.map((action) => (
			<ListActionIconButton key={action.id} action={action} />
		));

		return (
			<Row style={{ display: 'block' }}>
				<ListItemActionsWrapper
					data-testid={`contact-group-list-item-${id}`}
					contextualMenuActions={actions}
					hoverActions={hoverActions}
					onClick={clickHandler}
				>
					<ListItemAvatar item={avatar} />
					<ListItemContent>
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
					</ListItemContent>
				</ListItemActionsWrapper>
			</Row>
		);
	}
);

ContactGroupListItem.displayName = 'CgListItem';
