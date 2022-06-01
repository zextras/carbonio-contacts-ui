/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, List, Padding, Text } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { reduce, find, map } from 'lodash';
import { useParams } from 'react-router-dom';
import ContactListItem from './contact-list-item';

const DragImageContainer = styled.div`
	position: absolute;
	top: -5000px;
	left: -5000px;
	transform: translate(-100%, -100%);
	width: 35vw;
`;

const DragItems = ({ contacts, draggedIds }) => {
	const items = reduce(
		draggedIds,
		(acc, v, k) => {
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
			{map(items, (item) => (
				<ContactListItem item={item} key={item.id} draggedIds={draggedIds} />
			))}
		</>
	);
};

export const ContactsList = ({ folderId, selected, contacts, toggle }) => {
	const [t] = useTranslation();
	const { itemId } = useParams();
	const [isDragging, setIsDragging] = useState(false);
	const [draggedIds, setDraggedIds] = useState();
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
				<Container>
					<Padding top="medium">
						<Text
							color="gray1"
							overflow="break-word"
							size="small"
							style={{ whiteSpace: 'pre-line', textAlign: 'center', paddingTop: '32px' }}
						>
							{displayerTitle}
						</Text>
					</Padding>
				</Container>
			) : (
				<List
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
