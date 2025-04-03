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
import { searchContactsHelper } from '../../../views/search-contacts-helper';
import { useSelection } from '../../hooks/useSelection';
import { addContactsToStore, setContactsInStore, useContactsByParent } from '../../store/contacts';
import { isGroup } from '../../utils/helpers';
import { normalizeContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';
import { SelectPanelActions } from '../folder/select-panel-actions';
import { FolderViewSearchResults } from '../search/types';

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
	const { folderId } = useParams<RouteParams>() as { folderId: string };
	const folder = useFolder(folderId);
	const { setCount } = useAppContext<UseAppContextType>();
	const loading = useRef(false);
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);
	const [activeFilter, setActiveFilter] = useState<ContactFilterType>(FILTER_TYPES.ALL);

	const prevQuery = useRef<string>('');
	const initialState = useMemo(
		() => ({
			contacts: [],
			more: false,
			offset: 0
		}),
		[]
	);
	const [searchResults, setSearchResults] = useState<FolderViewSearchResults>(initialState);
	const currentFolder = useFolder(folderId);
	const parent =
		currentFolder && currentFolder.isLink
			? `${currentFolder.zid}:${currentFolder.rid}`
			: currentFolder?.id;
	const searchContacts = useContactsByParent(parent ?? '');

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
			if (loading.current) return;
			prevQuery.current = queryStr;
			loading.current = true;
			const offset = reset ? 0 : searchResults.offset;
			searchContactsHelper({
				query: { _content: queryStr },
				offset,
				sortBy: 'nameAsc'
			})
				.then((searchResultResponse) => {
					const newContacts = normalizeContactsFromSoap(searchResultResponse.cn);
					setSearchResults({
						offset: searchResultResponse.offset,
						more: searchResultResponse.more
					});
					reset ? setContactsInStore(newContacts) : addContactsToStore(newContacts);
				})
				.finally(() => {
					loading.current = false;
				});
		},
		[searchResults.offset]
	);

	const query = useMemo((): string => {
		let queryContent = `inid:"${folderId}"`;
		if (activeFilter === 'CONTACT') {
			queryContent += ` and not #type:group`;
		} else if (activeFilter === 'CONTACT_GROUP') {
			queryContent += ` and #type:group`;
		}
		return queryContent;
	}, [activeFilter, folderId]);

	useEffect(() => {
		if (query === prevQuery.current) return;
		searchQuery(query, true);
	}, [query, searchQuery]);

	const selectType = useCallback((filterType: ContactFilterType) => {
		setActiveFilter(filterType);
	}, []);

	const loadMore = useCallback(() => {
		if (searchResults.more) {
			searchQuery(query, false);
		}
	}, [query, searchQuery, searchResults.more]);

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
					onListBottom={loadMore}
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
