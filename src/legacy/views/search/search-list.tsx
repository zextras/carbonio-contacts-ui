/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Button, Container, List, Padding, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { SearchContactListItem } from './search-contact-list-item';
import { type SearchResults } from './search-view';
import { ShimmerList } from './shimmer-list';
import { CustomListItem } from '../../../carbonio-ui-commons/components/list/list-item';

const BorderContainer = styled(Container)`
	border-bottom: 0.0625rem solid ${({ theme }): string => theme?.palette?.gray2?.regular};
	border-right: 0.0625rem solid ${({ theme }): string => theme?.palette?.gray2?.regular};
`;

type SearchListProps = {
	searchResults: SearchResults;
	search: (arg0: string, arg1: boolean) => void;
	query: string;
	loading: boolean;
	filterCount: number;
	setShowAdvanceFilters: (arg0: boolean) => void;
};
export const SearchList = ({
	searchResults,
	search,
	query,
	loading,
	filterCount,
	setShowAdvanceFilters
}: SearchListProps): React.JSX.Element => {
	const [t] = useTranslation();
	const { itemId } = useParams<{ itemId: string }>();
	const loadMore = useCallback(() => {
		if (searchResults && searchResults.contacts.length > 0 && searchResults.more) {
			search(query, false);
		}
	}, [query, search, searchResults]);

	const canLoadMore = useMemo(
		() => !loading && searchResults && searchResults.contacts.length > 0 && searchResults.more,
		[loading, searchResults]
	);
	const displayerTitle = useMemo(() => {
		if (searchResults?.contacts.length === 0) {
			t('displayer.search_list_title1', 'It looks like there are no results. Keep searching!');
		}
		return null;
	}, [t, searchResults?.contacts.length]);

	const listItems = useMemo(
		() =>
			map(searchResults.contacts, (contact) => {
				const isActive = itemId === contact.id;

				return (
					<CustomListItem
						selected={false}
						active={isActive}
						key={contact.id}
						background={'transparent'}
					>
						{(visible: boolean): React.JSX.Element =>
							visible ? (
								<SearchContactListItem item={contact} />
							) : (
								<div style={{ height: '4rem' }} />
							)
						}
					</CustomListItem>
				);
			}),
		[itemId, searchResults.contacts]
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
			{loading && <ShimmerList />}
			{searchResults?.contacts.length > 0 && !loading && (
				<Container>
					<List
						background="gray6"
						onListBottom={canLoadMore ? loadMore : undefined}
						data-testid="SearchResultContactsContainer"
					>
						{listItems}
					</List>
				</Container>
			)}
			{searchResults?.contacts.length === 0 && !loading && (
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
