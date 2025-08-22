/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo, useRef, useState } from 'react';

import { List, ListItem } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ContactListItem } from 'legacy/views/app/folder-panel/contact-list-item';
import { DragItems } from 'legacy/views/app/folder-panel/drag-items';
import { EmptyListPanel } from 'legacy/views/app/folder-panel/empty-list-panel';
import { ContactGroupListItem } from 'views/contact-groups/list/contact-group-list-item';
import { ContactOrGroup } from 'legacy/types/contact';
import { isGroup } from 'legacy/utils/helpers';

const DragImageContainer = styled.div`
	position: absolute;
	top: -312.5rem;
	left: -312.5rem;
	transform: translate(-100%, -100%);
	width: 35vw;
`;

type ContactsListProps = {
	folderId: string;
	selected: Record<string, boolean>;
	isSelecting: boolean;
	contacts: Array<ContactOrGroup>;
	toggle: (id: string) => void;
	onListBottom?: () => void;
};
export const ContactsList = ({
	folderId,
	selected,
	isSelecting,
	contacts,
	toggle,
	onListBottom
}: ContactsListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { itemId } = useParams<{ itemId: string }>();
	const [isDragging, setIsDragging] = useState(false);
	const [draggedIds, setDraggedIds] = useState<Record<string, boolean>>();
	const dragImageRef = useRef(null);

	const listMessages = useMemo(
		() => [
			{
				title: t(`displayer.list_title1`, 'It looks like there are no contacts yet'),
				description: ''
			},
			{
				title: t(`displayer.list_title2`, 'The trash is empty'),
				description: ''
			}
		],
		[t]
	);

	const listItems = useMemo(
		() =>
			map(contacts, (contact) => {
				const isSelected = selected[contact.id];
				const active = itemId === contact.id;
				if (isGroup(contact)) {
					return (
						<ListItem
							key={contact.id}
							selected={isSelected}
							active={active}
							data-testid={`custom-list-item-${contact.id}`}
						>
							{(): React.JSX.Element => (
								<ContactGroupListItem
									selected={isSelected}
									selecting={isSelecting}
									toggle={toggle}
									contactGroup={contact}
									setDraggedIds={setDraggedIds}
									setIsDragging={setIsDragging}
									selectedItems={selected}
									dragImageRef={dragImageRef}
									key={`contact-group-${contact.id}`}
								/>
							)}
						</ListItem>
					);
				}

				return (
					<ListItem
						key={contact.id}
						selected={isSelected}
						active={active}
						data-testid={`custom-contact-list-item-${contact.id}`}
					>
						{(visible: boolean): ReactElement =>
							visible ? (
								<ContactListItem
									item={contact}
									selected={isSelected}
									folderId={folderId}
									selecting={isSelecting}
									active={active}
									toggle={toggle}
									setDraggedIds={setDraggedIds}
									setIsDragging={setIsDragging}
									selectedItems={selected}
									dragImageRef={dragImageRef}
								/>
							) : (
								<div
									style={{ height: '4rem' }}
									data-testid={`contact-list-item-invisible-${contact.id}`}
								/>
							)
						}
					</ListItem>
				);
			}),
		[contacts, folderId, isSelecting, itemId, selected, toggle]
	);

	const displayerMessage = useMemo(() => {
		if (contacts?.length === 0) {
			return folderId === '3' ? listMessages[1] : listMessages[0];
		}
		return null;
	}, [contacts, folderId, listMessages]);
	const displayerTitle = displayerMessage ? displayerMessage.title : '';
	return (
		<>
			{contacts?.length === 0 ? (
				<EmptyListPanel
					data-testid="ContactsListToScrollContainer"
					emptyListTitle={displayerTitle}
				/>
			) : (
				<List
					background={'gray6'}
					onListBottom={onListBottom}
					data-testid="SearchResultContactsContainer"
				>
					{listItems}
				</List>
			)}
			<DragImageContainer ref={dragImageRef}>
				{isDragging && <DragItems contacts={contacts} draggedIds={draggedIds} />}
			</DragImageContainer>
		</>
	);
};
