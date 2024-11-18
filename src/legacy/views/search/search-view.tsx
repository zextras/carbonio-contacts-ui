/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Container, Spinner } from '@zextras/carbonio-design-system';
import { type SearchViewProps, soapFetch } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import AdvancedFilterModal from './advance-filter-modal';
import { SearchList } from './search-list';
import SearchPanel from './search-panel';
import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { useUpdateView } from '../../../carbonio-ui-commons/hooks/use-update-view';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { usePrefs } from '../../../carbonio-ui-commons/utils/use-prefs';
import { Contact } from '../../types/contact';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

export type SearchResults = {
	contacts: Array<Contact>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: string;
};

const SearchView: FC<SearchViewProps> = ({ useQuery, ResultsHeader }) => {
	const [query, updateQuery] = useQuery();
	useUpdateView();

	const [searchResults, setSearchResults] = useState<SearchResults>({
		contacts: [],
		more: false,
		offset: 0,
		sortBy: 'nameAsc',
		query: ''
	});

	const loading = useRef(false);
	const [t] = useTranslation();
	const [filterCount, setFilterCount] = useState(0);
	const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
	const { zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch } = usePrefs();
	const [includeTrash, includeSharedFolders] = useMemo(
		() => [
			zimbraPrefIncludeTrashInSearch === 'TRUE',
			zimbraPrefIncludeSharedItemsInSearch === 'TRUE'
		],
		[zimbraPrefIncludeTrashInSearch, zimbraPrefIncludeSharedItemsInSearch]
	);
	const [isSharedFolderIncluded, setIsSharedFolderIncluded] = useState(includeSharedFolders);
	const folders = useFoldersMap();
	const searchInFolders = useMemo(
		() =>
			reduce(
				folders,
				(acc: Array<string>, folder: Folder, folderId: string) => {
					if (includeTrash && isTrash(folderId)) {
						acc.push(folderId);
					}
					if (folder.perm && !isTrash(folderId)) {
						acc.push(folderId);
					}
					return acc;
				},
				[]
			),
		[folders, includeTrash]
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
			loading.current = true;
			soapFetch<any, any>('Search', {
				limit: 100,
				query: queryStr,
				offset: reset ? 0 : searchResults.contacts.length,
				sortBy: searchResults.sortBy,
				types: 'contact',
				_jsns: 'urn:zimbraMail'
			})
				.then(
					({ cn, more, offset, sortBy }): SearchResults => ({
						query: queryStr,
						contacts: [
							...(reset ? [] : (searchResults.contacts ?? [])),
							...(normalizeContactsFromSoap(cn) ?? [])
						],
						more,
						offset: (offset ?? 0) + 100,
						sortBy: sortBy ?? 'nameAsc'
					})
				)
				.then((r) => {
					setSearchResults(r);
				})
				.finally(() => {
					loading.current = false;
				});
		},
		[searchResults.contacts, searchResults.sortBy]
	);

	useEffect(() => {
		if (query && query.length > 0 && queryToString !== searchResults.query && !loading.current) {
			setFilterCount(query.length);
			searchQuery(queryToString, true);
		}
	}, [query, queryToString, searchQuery, searchResults.query]);

	const { path } = useRouteMatch();

	return (
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
							query={queryToString}
							filterCount={filterCount}
							setShowAdvanceFilters={setShowAdvanceFilters}
						/>
					</Route>
				</Switch>
				<Suspense fallback={<Spinner color="gray5" />}>
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
	);
};

export default SearchView;
