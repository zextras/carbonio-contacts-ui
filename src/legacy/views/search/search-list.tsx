/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Button, Container, List, ListItem, Padding, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { SearchContactListItem } from './search-contact-list-item';
import { ContactGroupListItem } from '../../../views/contact-groups/list/contact-group-list-item';
import { ContactOrGroup } from '../../types/contact';
import { isGroup } from '../../utils/helpers';

const BorderContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
	border-right: 0.0625rem solid ${({ theme }): string => theme.palette.gray2.regular};
`;

type SearchListProps = {
	contacts: Array<ContactOrGroup>;
	onListBottom?: () => void;
	filterCount: number;
	setShowAdvanceFilters: (show: boolean) => void;
};
export const SearchList = ({
	contacts,
	onListBottom,
	filterCount,
	setShowAdvanceFilters
}: SearchListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { itemId } = useParams<{ itemId: string }>();

	const displayerTitle = useMemo(() => {
		if (contacts.length === 0) {
			t('displayer.search_list_title1', 'It looks like there are no results. Keep searching!');
		}
		return null;
	}, [t, contacts.length]);

	const listItems = useMemo(
		() =>
			map(contacts, (contact, index) => {
				const isActive = itemId === contact.id;
				if (isGroup(contact)) {
					return (
						<ContactGroupListItem
							key={`contact-group-list-item-${contact.id}`}
							contactGroup={contact}
						/>
					);
				}
				return (
					<ListItem selected={false} active={isActive} key={contact.id}>
						{(visible: boolean): React.JSX.Element =>
							visible ? (
								<SearchContactListItem item={contact} />
							) : (
								<div style={{ height: '4rem' }} />
							)
						}
					</ListItem>
				);
			}),
		[itemId, contacts]
	);

	return (
		<Container
			background="gray6"
			maxWidth="40.625rem"
			width="25%"
			orientation="vertical"
			mainAlignment="flex-start"
			data-testid="ContactsSearchResultListContainer"
		>
			<BorderContainer padding="small" height="fit" borderRadius="none">
				<Button
					onClick={(): void => setShowAdvanceFilters(true)}
					type={filterCount > 0 ? 'default' : 'outlined'}
					width={'fill'}
					label={
						filterCount === 0
							? t('title.advanced_filters', 'Advanced Filters')
							: t('label.advanced_filter', {
									count: filterCount,
									defaultValue_one: '{{count}} Advanced Filter',
									defaultValue_other: '"{{count}} Advanced Filters'
								})
					}
					icon="Options2Outline"
				/>
			</BorderContainer>
			{contacts.length > 0 && (
				<Container>
					<List
						background="gray6"
						onListBottom={onListBottom}
						data-testid="SearchResultContactsContainer"
					>
						{listItems}
					</List>
				</Container>
			)}
			{contacts.length === 0 && (
				<Container>
					<Padding top="medium">
						<Text
							data-testid="displayer-title"
							color="gray1"
							overflow="break-word"
							size="small"
							style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
						>
							{displayerTitle}
						</Text>
					</Padding>
				</Container>
			)}
		</Container>
	);
};
