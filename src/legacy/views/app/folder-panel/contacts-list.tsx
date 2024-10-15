/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import { List } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ContactListItem } from './contact-list-item';
import { DragItems } from './drag-items';
import { EmptyListPanel } from './empty-list-panel';
import { CustomListItem } from '../../../../carbonio-ui-commons/components/list/list-item';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { searchContactsAsyncThunk } from '../../../store/actions/search-contacts';
import { selectFolderHasMore } from '../../../store/slices/contacts-slice';
import { Contact } from '../../../types/contact';

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
	contacts: Array<Contact>;
	toggle: (id: string) => void;
};
export const ContactsList = ({
	folderId,
	selected,
	isSelecting,
	contacts,
	toggle
}: ContactsListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const loading = useRef(false);
	const { itemId } = useParams<{ itemId: string }>();
	const [isDragging, setIsDragging] = useState(false);
	const [draggedIds, setDraggedIds] = useState<Record<string, boolean>>();
	const dragImageRef = useRef(null);
	const dispatch = useAppDispatch();

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

	const hasMore = useAppSelector((state) => selectFolderHasMore(state, folderId));

	const search = useCallback(
		(reset: boolean) => {
			loading.current = true;
			dispatch(searchContactsAsyncThunk({ folderId, offset: reset ? 0 : contacts.length })).finally(
				() => {
					loading.current = false;
				}
			);
		},
		[contacts.length, dispatch, folderId]
	);

	const loadMore = useCallback(() => {
		if (contacts.length > 0 && hasMore) {
			search(false);
		}
	}, [contacts.length, hasMore, search]);

	const canLoadMore = useMemo(() => contacts.length > 0 && hasMore, [contacts.length, hasMore]);

	const listItems = useMemo(
		() =>
			map(contacts, (contact) => {
				const isSelected = selected[contact.id];
				const active = itemId === contact.id;
				return (
					<CustomListItem
						key={contact.id}
						selected={isSelected}
						active={active}
						background={active ? 'gray6' : 'gray5'}
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
								<div style={{ height: '4rem' }} />
							)
						}
					</CustomListItem>
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
					onListBottom={canLoadMore ? loadMore : undefined}
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
