/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { MouseEventHandler, useCallback, useMemo, DragEvent } from 'react';

import { Container, Drag } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';

import { ItemAvatar } from './item-avatar';
import { ItemContent } from './item-content';
import { getTagsArray } from '../../../helpers/tags';
import { Contact } from '../../../types/contact';
import ListItemActionWrapper from '../../folder/list-item-action-wrapper';

type ContactListitemProps = {
	item: Contact;
	folderId?: string;
	selecting?: boolean;
	active?: boolean;
	toggle?: (arg0: string) => void;
	setDraggedIds?: (ids: Record<string, boolean>) => void;
	setIsDragging?: (arg0: boolean) => void;
	selectedItems?: Record<string, boolean>;
	selected?: boolean;
	dragImageRef?: React.RefObject<HTMLElement>;
};

export const ContactListItem = ({
	item,
	selected,
	folderId,
	selecting,
	active,
	toggle,
	setDraggedIds,
	setIsDragging,
	selectedItems,
	dragImageRef
}: ContactListitemProps): React.JSX.Element => {
	const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);
	const tagsFromStore = useTags();

	const tags = useMemo(() => getTagsArray(tagsFromStore, item.tags), [item.tags, tagsFromStore]);

	const _onClick = useCallback<MouseEventHandler<HTMLDivElement>>(
		(e) => {
			if (!e.isDefaultPrevented()) {
				replaceHistory(`/folder/${folderId}/contacts/${item.id}`);
			}
		},
		[folderId, item.id]
	);

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
			data={{ ...item, parentFolderId: folderId, selectedIDs: ids }}
			style={{ display: 'block' }}
			onDragStart={(e): void => dragCheck(e, item.id)}
		>
			<Container orientation="vertical" data-testid={'contact-list-item'}>
				<Container orientation="horizontal" mainAlignment="flex-start">
					<ListItemActionWrapper contact={item} onClick={_onClick} current={active}>
						<ItemAvatar
							item={item}
							selected={selected}
							selecting={selecting}
							toggle={toggle}
							folderId={folderId}
						/>
						<ItemContent item={item} tags={tags} />
					</ListItemActionWrapper>
				</Container>
			</Container>
		</Drag>
	);
};
