/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState, useCallback, Suspense } from 'react';
import { Container } from '@zextras/zapp-ui';
import { soapFetch, Spinner } from '@zextras/zapp-shell';
import { useTranslation } from 'react-i18next';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { Contact } from '../../types/contact';
import { normalizeContactsFromSoap } from '../../store/normalizations/normalize-contact-from-soap';
import AdvancedFilterModal from './advance-filter-modal';
import SearchList from './search-list';
import SearchPanel from './search-panel';

type SearchProps = {
	useQuery: () => [Array<any>, (arg: any) => void];
	ResultsHeader: FC<{ query: Array<any>; label: string }>;
};

type SearchResults = {
	contacts: Array<Contact>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: Array<{ label: string; value?: string }>;
};
const SearchView: FC<SearchProps> = ({ useQuery, ResultsHeader }) => {
	const [query, updateQuery] = useQuery();

	const [searchResults, setSearchResults] = useState<SearchResults>({
		contacts: [],
		more: false,
		offset: 0,
		sortBy: 'nameAsc',
		query: []
	});

	const [loading, setLoading] = useState(false);
	const [t] = useTranslation();
	const [filterCount, setFilterCount] = useState(0);
	const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

	const search = useCallback(
		(queryStr: Array<{ label: string; value?: string }>, reset: boolean) => {
			setLoading(true);
			soapFetch<any, any>('Search', {
				limit: 100,
				query: `${queryStr.map((c) => (c.value ? c.value : c.label)).join(' ')}`,
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
		if (query && query.length > 0 && query !== searchResults.query) {
			setLoading(true);
			setFilterCount(query.length);
			search(query, true);
		}
	}, [query, search, searchResults.query]);

	const { path } = useRouteMatch();

	return (
		<>
			<Container>
				<ResultsHeader
					query={searchResults?.query}
					label={t('label.results_for', 'Results for:')}
				/>
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
								search={search}
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
					onClose={(): void => setShowAdvanceFilters(false)}
					t={t}
				/>

				<AdvancedFilterModal
					query={query}
					updateQuery={updateQuery}
					open={showAdvanceFilters}
					onClose={(): void => setShowAdvanceFilters(false)}
					t={t}
				/>
			</Container>
		</>
	);
};

export default SearchView;
