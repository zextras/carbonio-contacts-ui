/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { DragEvent, useCallback, useMemo } from 'react';

import { Drag } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ListActionIconButton } from 'components/list/list-action-icon-button';
import { ListItemActionsWrapper } from 'components/list/list-item-actions-wrapper';
import { ListItemAvatar } from 'components/list/list-item-avatar';
import { ListItemContent } from 'components/list/list-item-content';
import { Text } from 'components/Text';
import { ContactGroup } from 'model/contact-group';
import { useContactGroupActions } from 'views/contact-groups/actions/use-contact-group-actions';
import { useRedirectToContactGroup } from 'views/contact-groups/navigation';

type CGListItemProps = {
	contactGroup: ContactGroup;
	setDraggedIds?: (ids: Record<string, boolean>) => void;
	setIsDragging?: (id: boolean) => void;
	selectedItems?: Record<string, boolean>;
	dragImageRef?: React.RefObject<HTMLElement>;
	selecting?: boolean;
	selected?: boolean;
	toggle?: (id: string) => void;
};

export const ContactGroupListItem = React.memo<CGListItemProps>(
	({
		contactGroup,
		setDraggedIds,
		setIsDragging,
		selectedItems,
		dragImageRef,
		selecting,
		selected,
		toggle
	}) => {
		const [t] = useTranslation();
		const redirectTo = useRedirectToContactGroup();

		const clickHandler = useCallback(() => {
			redirectTo(contactGroup);
		}, [contactGroup, redirectTo]);
		const avatar = {
			id: contactGroup.id,
			label: contactGroup.title,
			icon: 'PeopleOutline'
		};
		const actions = useContactGroupActions(contactGroup);

		const hoverActions = actions.map((action) => (
			<ListActionIconButton key={action.id} action={action} />
		));
		const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);

		const dragCheck = useCallback(
			(e: DragEvent, id: string) => {
				setIsDragging?.(true);
				if (dragImageRef?.current) {
					e?.dataTransfer?.setDragImage(dragImageRef.current, 0, 0);
				}
				if (selectedItems?.[id]) {
					setDraggedIds?.(selectedItems);
				} else {
					setDraggedIds?.({ [id]: true });
				}
			},
			[setIsDragging, dragImageRef, selectedItems, setDraggedIds]
		);

		return (
			<Drag
				type="contact"
				data={{ ...contactGroup, parentFolderId: contactGroup.parent, selectedIDs: ids }}
				style={{ display: 'block' }}
				onDragStart={(e): void => dragCheck(e, contactGroup.id)}
			>
				<ListItemActionsWrapper
					data-testid={`contact-group-list-item-${contactGroup.id}`}
					contextualMenuActions={actions}
					hoverActions={hoverActions}
					onClick={clickHandler}
				>
					<ListItemAvatar item={avatar} selected={selected} selecting={selecting} toggle={toggle} />
					<ListItemContent>
						<Text overflow="ellipsis" size="small">
							{contactGroup.title}
						</Text>
						<Text overflow="ellipsis" size="small" color={'gray1'}>
							{t('contactGroupList.addressCount', {
								count: contactGroup.members.length,
								defaultValue_one: '{{count}} address',
								defaultValue_other: `{{count}} addresses`
							})}
						</Text>
					</ListItemContent>
				</ListItemActionsWrapper>
			</Drag>
		);
	}
);

ContactGroupListItem.displayName = 'CgListItem';
