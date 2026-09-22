/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { List, ListItem } from '@zextras/carbonio-design-system';
import type { TFunction } from 'i18next';
import { groupBy, map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { ContactOrGroup } from 'legacy/types/contact';
import { ContactFilterType, FILTER_TYPES } from 'legacy/utils/build-contacts-query';
import { ALPHABET, getContactInitial, OTHER_INITIAL } from 'legacy/utils/contact-initial';
import { isGroup } from 'legacy/utils/helpers';
import { ContactListItem } from 'legacy/views/app/folder-panel/contact-list-item';
import { ContactsListSectionHeader } from 'legacy/views/app/folder-panel/contacts-list-section-header';
import { DragItems } from 'legacy/views/app/folder-panel/drag-items';
import { EmptyListPanel } from 'legacy/views/app/folder-panel/empty-list-panel';
import { ContactGroupListItem } from 'views/contact-groups/list/contact-group-list-item';

/*
 * The message of the empty list when a letter filter is active. Kept out of the
 * component to hold the whole "which of the four messages" decision in one place.
 */
const getLetterEmptyTitle = (t: TFunction, letter: string, isGroupFilter: boolean): string => {
	// the bucket matches any digit, so naming it in the message would be misleading
	if (letter === OTHER_INITIAL) {
		return isGroupFilter
			? t(
					'displayer.no_contact_groups_starting_with_digit',
					'There are no contact groups starting with a number'
				)
			: t(
					'displayer.no_contacts_starting_with_digit',
					'There are no contacts starting with a number'
				);
	}
	return isGroupFilter
		? t('displayer.no_contact_groups_starting_with', {
				letter,
				defaultValue: 'There are no contact groups starting with "{{letter}}"'
			})
		: t('displayer.no_contacts_starting_with', {
				letter,
				defaultValue: 'There are no contacts starting with "{{letter}}"'
			});
};

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
	activeLetter?: string | null;
	filterType?: ContactFilterType;
	onClearFilters?: () => void;
};
export const ContactsList = ({
	folderId,
	selected,
	isSelecting,
	contacts,
	toggle,
	onListBottom,
	activeLetter = null,
	filterType = FILTER_TYPES.ALL,
	onClearFilters
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

	const renderContact = useCallback(
		(contact: ContactOrGroup): ReactElement => {
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
		},
		[folderId, isSelecting, itemId, selected, toggle]
	);

	const listItems = useMemo(() => {
		const contactsByInitial = groupBy(contacts, getContactInitial);
		// When a letter is active the list only contains that section. Otherwise every
		// letter of the alphabet gets a header (even at zero, so that it can act as a
		// jump anchor), plus the "#" section when some loaded item falls outside A-Z.
		const sections = activeLetter
			? [activeLetter]
			: [...ALPHABET, ...(contactsByInitial[OTHER_INITIAL] ? [OTHER_INITIAL] : [])];

		return sections.flatMap((initial) => {
			const sectionContacts = contactsByInitial[initial] ?? [];
			return [
				<ListItem key={`section-${initial}`} data-testid={`contacts-list-section-item-${initial}`}>
					{(): React.JSX.Element => (
						<ContactsListSectionHeader letter={initial} count={sectionContacts.length} />
					)}
				</ListItem>,
				...map(sectionContacts, renderContact)
			];
		});
	}, [activeLetter, contacts, renderContact]);

	const isFiltered = activeLetter !== null || filterType !== FILTER_TYPES.ALL;

	const emptyListProps = useMemo(() => {
		if (activeLetter !== null) {
			return {
				emptyListTitle: getLetterEmptyTitle(
					t,
					activeLetter,
					filterType === FILTER_TYPES.CONTACT_GROUP
				),
				icon: 'PeopleOutline'
			};
		}
		if (isFiltered) {
			return {
				emptyListTitle:
					filterType === FILTER_TYPES.CONTACT_GROUP
						? t('displayer.no_contact_groups', 'There are no contact groups')
						: t('displayer.list_title1', 'It looks like there are no contacts yet'),
				icon: filterType === FILTER_TYPES.CONTACT_GROUP ? 'PeopleOutline' : 'PersonOutline'
			};
		}
		return {
			emptyListTitle: folderId === '3' ? listMessages[1].title : listMessages[0].title,
			icon: undefined
		};
	}, [activeLetter, filterType, folderId, isFiltered, listMessages, t]);

	return (
		<>
			{contacts?.length === 0 ? (
				<EmptyListPanel
					emptyListTitle={emptyListProps.emptyListTitle}
					icon={emptyListProps.icon}
					actionLabel={
						isFiltered && onClearFilters
							? t('label.clear_all_filters', 'CLEAR ALL FILTERS')
							: undefined
					}
					onAction={isFiltered ? onClearFilters : undefined}
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
