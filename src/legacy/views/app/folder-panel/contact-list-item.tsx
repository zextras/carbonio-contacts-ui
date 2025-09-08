/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, DragEvent, ReactNode } from 'react';

import { Drag } from '@zextras/carbonio-design-system';
import { useTags } from '@zextras/carbonio-ui-commons';
import { useNavigate } from 'react-router-dom';

import { ListActionIconButton } from 'components/list/list-action-icon-button';
import { ListItemActionsWrapper } from 'components/list/list-item-actions-wrapper';
import { ListItemAvatar } from 'components/list/list-item-avatar';
import { getTagsArray } from 'legacy/helpers/tags';
import { Contact } from 'legacy/types/contact';
import { ItemContent } from 'legacy/views/app/folder-panel/item-content';
import { useContactContextualMenuActions } from 'views/contacts/actions/use-contact-contextual-menu-actions';
import { useContactHoverActions } from 'views/contacts/actions/use-contact-hover-actions';

type ContactListItemProps = {
	item: Contact;
	folderId?: string;
	selecting?: boolean;
	active?: boolean;
	toggle?: (id: string) => void;
	setDraggedIds?: (ids: Record<string, boolean>) => void;
	setIsDragging?: (id: boolean) => void;
	selectedItems?: Record<string, boolean>;
	selected?: boolean;
	dragImageRef?: React.RefObject<HTMLElement>;
};

export const ContactListItem = ({
	item,
	selected,
	folderId,
	selecting,
	toggle,
	setDraggedIds,
	setIsDragging,
	selectedItems,
	dragImageRef
}: ContactListItemProps): React.JSX.Element => {
	const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);
	const tagsFromStore = useTags();
	const navigate = useNavigate();
	const tags = useMemo(() => getTagsArray(tagsFromStore, item.tags), [item.tags, tagsFromStore]);

	const openDisplayer = useCallback(() => {
		navigate(`../folder/${folderId}/contacts/${item.id}`);
	}, [folderId, item.id, navigate]);

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

	const avatarItem = {
		id: item.id,
		label: `${item.firstName} ${item.middleName} ${item.lastName}`
	};
	const contextualMenuActions = useContactContextualMenuActions(item);

	const hoverActions = useContactHoverActions(item);
	const hoverActionsIcons = useMemo<ReactNode[]>(
		() => hoverActions.map((action) => <ListActionIconButton key={action.id} action={action} />),
		[hoverActions]
	);
	return (
		<Drag
			type="contact"
			data={{ ...item, parentFolderId: folderId, selectedIDs: ids }}
			style={{ display: 'block' }}
			onDragStart={(e): void => dragCheck(e, item.id)}
		>
			<ListItemActionsWrapper
				data-testid={`contact-list-item-${item.id}`}
				contextualMenuActions={contextualMenuActions}
				hoverActions={hoverActionsIcons}
				onClick={openDisplayer}
			>
				<ListItemAvatar
					item={avatarItem}
					selected={selected}
					selecting={selecting}
					toggle={toggle}
				/>
				<ItemContent item={item} tags={tags} />
			</ListItemActionsWrapper>
		</Drag>
	);
};
