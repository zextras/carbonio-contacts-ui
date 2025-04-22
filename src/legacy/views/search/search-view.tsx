/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { Container, Spinner } from '@zextras/carbonio-design-system';
import type { SearchViewProps } from '@zextras/carbonio-search-ui';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { map, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import AdvancedFilterModal from './advance-filter-modal';
import { SearchContactsEmptyPanel } from './search-contacts-empty-panel';
import { SearchList } from './search-list';
import { SearchResults } from './types';
import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { useUpdateView } from '../../../carbonio-ui-commons/hooks/use-update-view';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types';
import { usePrefs } from '../../../carbonio-ui-commons/utils/use-prefs';
import { ContactGroupDisplayerWrapper } from '../../../views/contact-groups/displayer/contact-group-displayer-wrapper';
import { addContactsToStore, useContactsById } from '../../store/contacts';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';
import ContactEditPanel from '../edit/contact-edit-panel';
import { ContactPreviewWrapper } from '../preview/contact-preview-wrapper';

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
	const searchContacts = useContactsById(searchResults.contacts);

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

	const executeSearchPure = useCallback(
		({
			queryString,
			offset,
			abortSignal
		}: {
			queryString: string;
			offset: number;
			abortSignal?: AbortSignal;
		}) =>
			soapFetch<any, any>(
				'Search',
				{
					limit: 100,
					query: queryString,
					offset,
					sortBy: 'nameAsc',
					types: 'contact',
					_jsns: 'urn:zimbraMail'
				},
				undefined,
				abortSignal
			).then(({ cn, more }) => ({
				query: queryString,
				contacts: [...(normalizeContactsFromSoap(cn) ?? [])],
				more,
				offset: offset + 100,
				sortBy: 'nameAsc'
			})),
		[]
	);

	const executeSearch = useCallback(
		(reset: boolean, abortSignal?: AbortSignal) => {
			const offset = reset ? 0 : searchResults.contacts.length;
			executeSearchPure({
				offset,
				queryString: queryToString,
				abortSignal
			}).then((r) => {
				const contacts = [...(reset ? [] : (searchContacts ?? [])), ...(r.contacts ?? [])];
				const contactIds = contacts.map((c) => c.id);
				addContactsToStore(contacts);
				setSearchResults({
					...r,
					contacts: contactIds
				});
			});
		},
		[executeSearchPure, queryToString, searchContacts, searchResults.contacts.length]
	);

	useEffect(() => {
		if (query.length > 0) {
			setFilterCount(query.length);
			executeSearchPure({ queryString: queryToString, offset: 0 }).then((r) => {
				const contacts = r.contacts ?? [];
				const contactIds = contacts.map((c) => c.id);
				addContactsToStore(contacts);
				setSearchResults({
					...r,
					contacts: contactIds
				});
			});
		}
	}, [executeSearchPure, query.length, queryToString]);

	const loadMore = useCallback(() => {
		const controller = new AbortController();

		if (searchResults?.contacts.length > 0 && searchResults.more) {
			executeSearch(false, controller.signal);
		}

		return () => {
			controller.abort();
		};
	}, [executeSearch, searchResults]);

	const canLoadMore = useMemo(
		() => searchResults && searchResults.contacts.length > 0 && searchResults.more,
		[searchResults]
	);

	return (
		<Container>
			<ResultsHeader label={t('label.results_for', 'Results for:')} />
			<Container
				orientation="horizontal"
				background="gray4"
				style={{ overflowY: 'auto' }}
				mainAlignment="flex-start"
			>
				<Routes>
					<Route
						path={`:folder?/:folderId?/:type?/:itemId?`}
						element={
							<SearchList
								contacts={searchContacts}
								onListBottom={canLoadMore ? loadMore : undefined}
								filterCount={filterCount}
								setShowAdvanceFilters={setShowAdvanceFilters}
							/>
						}
					/>
				</Routes>
				<Suspense fallback={<Spinner color="gray5" />}>
					<Container width={'75%'} mainAlignment="flex-start">
						<Routes>
							<Route
								path={`folder/:folderId/contacts/:contactId`}
								element={<ContactPreviewWrapper />}
							/>
							<Route path={`folder/:folderId/edit/:editId`} element={<ContactEditPanel />} />
							<Route
								path={'folder/:folderId/contact-groups/:id'}
								element={<ContactGroupDisplayerWrapper />}
							/>
							<Route
								path={'/'}
								element={<SearchContactsEmptyPanel searchResults={searchResults} />}
							/>
						</Routes>
					</Container>
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
				executeSearch={executeSearch}
			/>
		</Container>
	);
};

export default SearchView;
