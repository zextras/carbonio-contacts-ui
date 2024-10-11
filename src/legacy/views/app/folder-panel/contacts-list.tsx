/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import { List } from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { reduce, find, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ContactListItem } from './contact-list-item';
import { EmptyListPanel } from './empty-list-panel';
import { CustomListItem } from '../../../../carbonio-ui-commons/components/list/list-item';
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
	draggedIds: Record<string, boolean> | undefined;
}): React.JSX.Element => {
	const items = reduce(
		draggedIds,
		(acc: Array<Contact>, v, k) => {
			const obj = find(contacts, ['id', k]);
			if (obj) {
				return [...acc, obj];
			}
			return acc;
		},
		[]
	);

	return (
		<>
			{map(items, (item, index) => (
				<ContactListItem item={item} key={index} draggedIds={draggedIds} />
			))}
		</>
	);
};
type ContactsListProps = {
	folderId: string;
	selected: Record<string, boolean>;
	contacts: Array<Contact>;
	toggle: (arg0: string) => void;
};
export const ContactsList = ({
	folderId,
	selected,
	contacts,
	toggle
}: ContactsListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const loading = useRef(false);
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

	// TODO
	const more = false;
	const sortBy = 'nameAsc';

	const search = useCallback(
		(reset: boolean) => {
			loading.current = true;
			soapFetch<any, any>('Search', {
				limit: 100,
				query: {
					_content: `inid:"${folderId}"`
				},
				offset: reset ? 0 : contacts.length,
				sortBy,
				types: 'contact',
				_jsns: 'urn:zimbraMail'
			}).finally(() => {
				loading.current = false;
			});
		},
		[contacts.length, folderId]
	);

	const loadMore = useCallback(() => {
		if (contacts.length > 0 && more) {
			search(false);
		}
	}, [contacts.length, more, search]);

	const canLoadMore = useMemo(() => contacts.length > 0 && more, [contacts.length, more]);

	const listItems = useMemo(
		() =>
			map(contacts, (contact) => {
				const isSelected = selected[contact.id];
				const active = itemId === contact.id;
				return (
					<CustomListItem
						key={contact.id}
						selected={false}
						active={active}
						background={active ? 'gray6' : 'gray5'}
					>
						{(visible: boolean): ReactElement =>
							visible ? (
								<ContactListItem
									item={contact}
									selected={isSelected}
									folderId={folderId}
									selecting={false}
									active={active}
									toggle={toggle}
									setDraggedIds={setDraggedIds}
									setIsDragging={setIsDragging}
									selectedItems={{}}
									dragImageRef={dragImageRef}
								/>
							) : (
								<div style={{ height: '4rem' }} />
							)
						}
					</CustomListItem>
				);
			}),
		[contacts, folderId, itemId, selected, toggle]
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
					background="gray6"
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
