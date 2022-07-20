/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { Container, Drag } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { includes, reduce } from 'lodash';
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
	const ids = useMemo(() => Object.keys(selectedItems ?? []), [selectedItems]);
	const tagsFromStore = useTags();

	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(item.tags, v.id))
						acc.push({ ...v, color: ZIMBRA_STANDARD_COLORS[parseInt(v.color ?? '0', 10)].hex });
					return acc;
				},
				[]
			),
		[item.tags, tagsFromStore]
	);

	const _onClick = useCallback(
		(e) => {
			if (!e.isDefaultPrevented()) {
				replaceHistory(`/folder/${folderId}/contacts/${item.id}`);
			}
		},
		[folderId, item.id]
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
	) : (
		<div style={{ height: '64px' }} />
	);
}
