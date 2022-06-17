/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ButtonOld as Button,
	Container,
	List,
	Padding,
	Text
} from '@zextras/carbonio-design-system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import SearchListItem from './search-list-item';
import ShimmerList from './shimmer-list';

const BorderContainer = styled(Container)`
	border-bottom: 1px solid ${({ theme }) => theme?.palette?.gray2?.regular};
	border-right: 1px solid ${({ theme }) => theme?.palette?.gray2?.regular};
`;

const SearchList = ({
	searchResults,
	search,
	query,
	loading,
	filterCount,
	setShowAdvanceFilters
}) => {
	const [t] = useTranslation();
	const { itemId } = useParams();
	const loadMore = useCallback(() => {
		if (searchResults && searchResults.contacts.length > 0 && searchResults.more) {
			search(query, false);
		}
	}, [query, search, searchResults]);

	const canLoadMore = useMemo(
		() => !loading && searchResults && searchResults.contacts.length > 0 && searchResults.more,
		[loading, searchResults]
	);

	const [randomListIndex, setRandomListIndex] = useState(0);
	useEffect(() => {
		if (randomListIndex === 0) {
			setRandomListIndex(1);
		} else {
			setRandomListIndex(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchResults?.contacts.length, query]);
	const displayerTitle = useMemo(() => {
		if (searchResults?.contacts.length === 0) {
			if (randomListIndex === 0) {
				return t(
					'displayer.search_list_title1',
					'It looks like there are no results. Keep searching!'
				);
			}
			return t('displayer.search_list_title2', 'None of your items matches your search.');
		}
		return null;
	}, [randomListIndex, t, searchResults?.contacts.length]);

	return (
		<Container
			background="gray6"
			maxWidth="650px"
			width="25%"
			orientation="vertical"
			mainAlignment="flex-start"
		>
			<BorderContainer padding="small" height="fit" borderRadius="none">
				<Button
					onClick={() => setShowAdvanceFilters(true)}
					type={filterCount > 0 ? 'default' : 'outlined'}
					size="fill"
					label={
						filterCount === 0
							? t('label.single_advanced_filter', 'Advanced Filter')
							: t('label.advanced_filter', {
									count: filterCount,
									defaultValue: '{{count}} Advanced Filter',
									defaultValue_plural: '"{{count}} Advanced Filters'
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
						items={searchResults?.contacts ?? []}
						ItemComponent={SearchListItem}
						onListBottom={canLoadMore ? loadMore : undefined}
						active={itemId}
					/>
				</Container>
			)}
			{searchResults?.contacts.length === 0 && !loading && (
				<Container>
					<Padding top="medium">
						<Text
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

export default SearchList;
