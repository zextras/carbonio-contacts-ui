/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { Container, Drag, Divider } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import ListItemActionWrapper from '../../folder/list-item-action-wrapper';
import { ItemAvatar } from './item-avatar';
import { ItemContent } from './item-content';

export default function ContactListItem({
	item,
	selected,
	folderId,
	selecting,
	active,
	toggle,
	visible,
	setDraggedIds,
	draggedIds,
	setIsDragging,
	selectedItems,
	dragImageRef
}) {
	const replaceHistory = useReplaceHistoryCallback();
	const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);

	const _onClick = useCallback(
		(e) => {
			if (!e.isDefaultPrevented()) {
				replaceHistory(`/folder/${folderId}/contacts/${item.id}`);
			}
		},
		[folderId, item.id, replaceHistory]
	);
	const dragCheck = useCallback(
		(e, id) => {
			setIsDragging(true);
			e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
			if (selectedItems[id]) {
				setDraggedIds(selectedItems);
			} else {
				setDraggedIds({ [id]: true });
			}
		},
		[setIsDragging, dragImageRef, selectedItems, setDraggedIds]
	);

	return draggedIds?.[item?.id] || visible ? (
		<Drag
			type="contact"
			data={{ ...item, parentFolderId: folderId, selectedIDs: ids }}
			style={{ display: 'block' }}
			onDragStart={(e) => dragCheck(e, item.id)}
		>
			<Container orientation="vertical">
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					background={active ? 'highlight' : 'gray6'}
				>
					<ListItemActionWrapper contact={item} onClick={_onClick} current={active}>
						<ItemAvatar
							item={item}
							selected={selected}
							selecting={selecting}
							toggle={toggle}
							folderId={folderId}
						/>
						<ItemContent item={item} />
					</ListItemActionWrapper>
				</Container>
				<Divider />
			</Container>
		</Drag>
	) : (
		<div style={{ height: '64px' }} />
	);
}
