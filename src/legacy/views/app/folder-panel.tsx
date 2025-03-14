/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Container, MultiButton, Row, Tooltip } from '@zextras/carbonio-design-system';
import { useAppContext } from '@zextras/carbonio-shell-ui';
import { filter, find, noop, orderBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Breadcrumbs } from './breadcrumbs';
import { ContactsList } from './folder-panel/contacts-list';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { soapFetch } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { useSelection } from '../../hooks/useSelection';
import { addContactsToStore, useContactsById } from '../../store/contacts';
import { ContactOrGroup } from '../../types/contact';
import { isGroup } from '../../utils/helpers';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';
import { SelectPanelActions } from '../folder/select-panel-actions';
import { SearchResults } from '../search/types';

type RouteParams = {
	folderId: string;
};

type UseAppContextType = {
	setCount: (count: number) => void;
};

const FILTER_TYPES = {
	ALL: 'ALL',
	CONTACT: 'CONTACT',
	CONTACT_GROUP: 'CONTACT_GROUP'
} as const;

type ContactFilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

export const FolderPanel = (): ReactElement => {
	const [t] = useTranslation();
	const { folderId } = useParams<RouteParams>();
	const folder = useFolder(folderId ?? '');
	const { setCount } = useAppContext<UseAppContextType>();
	const loading = useRef(false);
	const searchDone = useRef(false);
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);
	const [activeFilter, setActiveFilter] = useState<ContactFilterType>(FILTER_TYPES.ALL);

	const initialState = useMemo(
		() => ({
			contacts: [],
			more: false,
			offset: 0,
			sortBy: 'nameAsc',
			query: ''
		}),
		[]
	);
	const [searchResults, setSearchResults] = useState<SearchResults>(initialState);

	const searchContacts = useContactsById(searchResults.contacts).filter(
		(contact: ContactOrGroup) => contact.parent === folderId
	);

	const sortedContacts = useMemo(
		() =>
			orderBy(
				searchContacts,
				[
					(item): string =>
						isGroup(item)
							? item?.title?.toLowerCase()
							: item?.firstName?.toLowerCase() ||
								item?.lastName?.toLowerCase() ||
								item?.middleName?.toLowerCase()
				],
				'asc'
			),
		[searchContacts]
	);
	const ids = useMemo(() => Object.keys(selected ?? []), [selected]);
	const selectedContacts = filter(searchContacts, (contact) => ids.indexOf(contact.id) !== -1);

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
				.then(({ cn, more, offset, sortBy }) => ({
					query: queryStr,
					contacts: [
						...(reset ? [] : (searchContacts ?? [])),
						...(normalizeContactsFromSoap(cn) ?? [])
					],
					more,
					offset: (offset ?? 0) + 100,
					sortBy: sortBy ?? 'nameAsc'
				}))
				.then((r) => {
					const contactIds = r.contacts.map((c) => c.id);
					addContactsToStore(r.contacts);
					setSearchResults({
						...r,
						contacts: contactIds
					});
				})
				.finally(() => {
					loading.current = false;
				});
		},
		[searchContacts, searchResults.contacts.length, searchResults.sortBy]
	);
	const queryToString = useMemo(() => {
		let queryContent = `inid:"${folderId}"`;
		if (activeFilter === 'CONTACT') {
			queryContent += ` and not #type:group`;
		} else if (activeFilter === 'CONTACT_GROUP') {
			queryContent += ` and #type:group`;
		}
		return queryContent;
	}, [activeFilter, folderId]);

	useEffect(() => {
		if (searchDone) {
			return;
		}
		searchQuery(queryToString, true);
	}, [activeFilter, folderId, queryToString, searchQuery]);

	const selectType = useCallback(
		(filterType: ContactFilterType) => {
			setSearchResults(initialState);
			setActiveFilter(filterType);
		},
		[initialState]
	);

	const loadMore = useCallback(() => {
		if (searchResults && searchResults.contacts.length > 0 && searchResults.more) {
			searchQuery(queryToString, false);
		}
	}, [queryToString, searchQuery, searchResults]);

	const canLoadMore = useMemo(
		() => searchResults && searchResults.contacts.length > 0 && searchResults.more,
		[searchResults]
	);

	const selectOptions = [
		{
			id: FILTER_TYPES.ALL,
			icon: 'FunnelOutline',
			label: t('folder_panel.option.all_contacts', 'All'),
			value: FILTER_TYPES.CONTACT,
			onClick: (): void => selectType(FILTER_TYPES.ALL),
			selected: activeFilter === FILTER_TYPES.ALL
		},
		{
			id: FILTER_TYPES.CONTACT,
			icon: 'PersonOutline',
			label: t('folder_panel.option.contacts', 'Contacts'),
			value: FILTER_TYPES.CONTACT,
			onClick: (): void => selectType(FILTER_TYPES.CONTACT),
			selected: activeFilter === FILTER_TYPES.CONTACT
		},
		{
			icon: 'PeopleOutline',
			id: FILTER_TYPES.CONTACT_GROUP,
			label: t('folder_panel.option.contact_group', 'Contact Groups'),
			value: FILTER_TYPES.CONTACT_GROUP,
			onClick: (): void => selectType(FILTER_TYPES.CONTACT_GROUP),
			selected: activeFilter === FILTER_TYPES.CONTACT_GROUP
		}
	];

	const selectedViewTypeIcon = find(selectOptions, (option) => option.id === activeFilter)?.icon;
	return (
		<Container
			orientation="row"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="fill"
			height="fill"
			background={'gray6'}
			borderRadius="none"
			data-testid="ContactsListContainer"
			style={{
				maxHeight: '100%'
			}}
		>
			<Container mainAlignment="flex-start" borderRadius="none">
				{isSelecting ? (
					<SelectPanelActions
						folderId={folderId ?? ''}
						deselectAll={deselectAll}
						selectedContacts={selectedContacts}
						selectedIds={selected}
					/>
				) : (
					<Breadcrumbs folderPath={folder?.absFolderPath ?? ''} itemsCount={folder?.n ?? 0}>
						<Row mainAlignment="flex-end">
							<Tooltip label={t('label.filter_mode', 'Filter mode')} maxWidth="100%">
								<MultiButton
									size={'large'}
									primaryIcon={selectedViewTypeIcon}
									type={'ghost'}
									onClick={noop}
									color={'gray0'}
									items={selectOptions}
									data-testid="select-contacts-view"
								/>
							</Tooltip>
						</Row>
					</Breadcrumbs>
				)}
				<ContactsList
					onListBottom={canLoadMore ? loadMore : undefined}
					folderId={folderId ?? ''}
					contacts={sortedContacts}
					selected={selected}
					isSelecting={isSelecting}
					toggle={toggle}
				/>
			</Container>
		</Container>
	);
};
