/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { type SearchViewProps, soapFetch, Spinner } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import AdvancedFilterModal from './advance-filter-modal';
import SearchList from './search-list';
import SearchPanel from './search-panel';
import { useAppSelector } from '../../hooks/redux';
import { selectFolders } from '../../store/selectors/folders';
import { Contact } from '../../types/contact';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

type SearchResults = {
	contacts: Array<Contact>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
};

const SearchView: FC<SearchViewProps> = ({ useQuery, ResultsHeader }) => {
	const [query, updateQuery] = useQuery();

	const [searchResults, setSearchResults] = useState<SearchResults>({
		contacts: [],
		more: false,
		offset: 0,
		sortBy: 'nameAsc',
		query: ''
	});

	const [loading, setLoading] = useState(false);
	const [t] = useTranslation();
	const [filterCount, setFilterCount] = useState(0);
	const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
	const [isSharedFolderIncluded, setIsSharedFolderIncluded] = useState(true);
	const folders = useAppSelector(selectFolders);
	const searchInFolders = useMemo(
		() =>
			reduce(
				folders,
				(acc: string[], v, k) => {
					if (v.isShared || v.perm) {
						acc.push(v.id);
					}
					return acc;
				},
				[]
			),
		[folders]
	);

	const foldersToSearchInQuery = useMemo(
		() => `( ${map(searchInFolders, (folder) => `inid:"${folder}"`).join(' OR ')} OR is:local) `,
		[searchInFolders]
	);

	const queryToString = useMemo(
		() =>
			isSharedFolderIncluded && searchInFolders?.length > 0
				? `(${query.map((c) => (c.value ? c.value : c.label)).join(' ')}) ${foldersToSearchInQuery}`
				: `${query.map((c) => (c.value ? c.value : c.label)).join(' ')}`,
		[isSharedFolderIncluded, searchInFolders.length, query, foldersToSearchInQuery]
	);

	const searchQuery = useCallback(
		(queryStr: string, reset: boolean) => {
			setLoading(true);
			soapFetch<any, any>('Search', {
				limit: 100,
				query: queryStr,
				offset: reset ? 0 : searchResults.offset,
				sortBy: searchResults.sortBy,
				types: 'contact',
				_jsns: 'urn:zimbraMail'
			})
				.then(
					({ cn, more, offset, sortBy }): SearchResults => ({
						query: queryStr,
						contacts: [
							...(reset ? [] : searchResults.contacts ?? []),
							...(normalizeContactsFromSoap(cn) ?? [])
						],
						more,
						offset: (offset ?? 0) + 100,
						sortBy: sortBy ?? 'nameAsc'
					})
				)
				.then((r) => {
					setSearchResults(r);
					setLoading(false);
				});
		},
		[searchResults.contacts, searchResults.offset, searchResults.sortBy]
	);

	useEffect(() => {
		if (query && query.length > 0 && queryToString !== searchResults.query) {
			setLoading(true);
			setFilterCount(query.length);
			searchQuery(queryToString, true);
		}
	}, [query, queryToString, searchQuery, searchResults.query]);

	const { path } = useRouteMatch();

	return (
		<>
			<Container>
				<ResultsHeader label={t('label.results_for', 'Results for:')} />
				<Container
					orientation="horizontal"
					background="gray4"
					style={{ overflowY: 'auto' }}
					mainAlignment="flex-start"
				>
					<Switch>
						<Route path={`${path}/:folder?/:folderId?/:type?/:itemId?`}>
							<SearchList
								searchResults={searchResults}
								search={searchQuery}
								query={query}
								loading={loading}
								filterCount={filterCount}
								setShowAdvanceFilters={setShowAdvanceFilters}
							/>
						</Route>
					</Switch>
					<Suspense fallback={<Spinner />}>
						<SearchPanel searchResults={searchResults} query={query} width="75%" />
					</Suspense>
				</Container>

				<AdvancedFilterModal
					query={query}
					updateQuery={updateQuery}
					open={showAdvanceFilters}
					isSharedFolderIncluded={isSharedFolderIncluded}
					setIsSharedFolderIncluded={setIsSharedFolderIncluded}
					onClose={(): void => setShowAdvanceFilters(false)}
					t={t}
				/>
			</Container>
		</>
	);
};

export default SearchView;
