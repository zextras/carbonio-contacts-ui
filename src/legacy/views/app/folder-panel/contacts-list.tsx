/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useRef, useState } from 'react';

import { reduce, find, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import ContactListItem from './contact-list-item';
import { EmptyListPanel } from './empty-list-panel';
import { ListOld } from './list';
import { Contact } from '../../../types/contact';

const DragImageContainer = styled.div`
	position: absolute;
	top: -312.5rem;
	left: -312.5rem;
	transform: translate(-100%, -100%);
	width: 35vw;
`;

const DragItems = ({
	contacts,
	draggedIds
}: {
	contacts: Array<Contact>;
	draggedIds: Record<string, unknown>;
}): React.JSX.Element => {
	const items = reduce(
		draggedIds,
		(acc, v, k) => {
			const obj = find(contacts, ['id', k]);
			if (obj) {
				return [...acc, obj];
			}
			return acc;
		},
		[] as Record<string, unknown>[]
	);

	return (
		<>
			{map(items, (item) => (
				<ContactListItem item={item} key={item.id} draggedIds={draggedIds} />
			))}
		</>
	);
};
type ContactsListProps = {
	folderId: string;
	selected: Record<string, unknown>;
	contacts: Array<Contact>;
	toggle: boolean;
};
export const ContactsList = ({
	folderId,
	selected,
	contacts,
	toggle
}: ContactsListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { itemId } = useParams<{ itemId: string }>();
	const [isDragging, setIsDragging] = useState(false);
	const [draggedIds, setDraggedIds] = useState({});
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
				<ListOld
					data-testid="ContactsListToScrollContainer"
					selected={selected}
					background="gray6"
					active={itemId}
					items={contacts}
					itemProps={{
						folderId,
						toggle,
						setDraggedIds,
						setIsDragging,
						draggedIds,
						selectedItems: selected,
						dragImageRef
					}}
					ItemComponent={ContactListItem}
				/>
			)}
			<DragImageContainer ref={dragImageRef}>
				{isDragging && <DragItems contacts={contacts} draggedIds={draggedIds} />}
			</DragImageContainer>
		</>
	);
};
