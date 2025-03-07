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
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useSelection } from '../../hooks/useSelection';
import { searchContactsAsyncThunk } from '../../store/actions/search-contacts';
import { selectAllContactsInFolder, selectContactsStatus } from '../../store/selectors/contacts';
import { handleResetContactsSync } from '../../store/slices/contacts-slice';
import { ActionsContextProvider } from '../../ui-actions/actions-context';
import { isGroup } from '../../utils/helpers';
import { SelectPanelActions } from '../folder/select-panel-actions';

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
	const isFirstRender = useRef(true);
	const { folderId } = useParams<RouteParams>();
	const dispatch = useAppDispatch();
	const folder = useFolder(folderId ?? '');
	const { setCount } = useAppContext<UseAppContextType>();
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);
	const [activeFilter, setActiveFilter] = useState<ContactFilterType>(FILTER_TYPES.ALL);
	const contacts = useAppSelector((state) => selectAllContactsInFolder(state, folderId ?? ''));
	const searchRequestStatus = useAppSelector((state) =>
		selectContactsStatus(state, folderId ?? '')
	);
	const sortedContacts = useMemo(
		() =>
			orderBy(
				contacts,
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
		[contacts]
	);
	const ids = useMemo(() => Object.keys(selected ?? []), [selected]);
	const selectedContacts = filter(contacts, (contact) => ids.indexOf(contact.id) !== -1);

	useEffect(() => {
		if (searchRequestStatus !== undefined) {
			return;
		}
		dispatch(searchContactsAsyncThunk({ folderId: folderId ?? '', type: activeFilter })).finally(
			() => {
				isFirstRender.current = false;
			}
		);
	}, [activeFilter, dispatch, folderId, searchRequestStatus]);

	const selectType = useCallback(
		(filterType: ContactFilterType) => {
			dispatch(handleResetContactsSync());
			setActiveFilter(filterType);
		},
		[dispatch]
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
	const loadMore = useCallback(
		(): Promise<void> =>
			dispatch(
				searchContactsAsyncThunk({
					folderId: folderId ?? '',
					offset: contacts?.length,
					type: activeFilter
				})
			).then(() => Promise.resolve()),
		[activeFilter, contacts?.length, dispatch, folderId]
	);
	return (
		<ActionsContextProvider
			folderId={folderId ?? ''}
			deselectAll={deselectAll}
			selectedContacts={selectedContacts}
			selectedIds={selected}
		>
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
						<SelectPanelActions deselectAll={deselectAll} />
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
						onLoadMore={loadMore}
						folderId={folderId ?? ''}
						contacts={sortedContacts}
						selected={selected}
						isSelecting={isSelecting}
						toggle={toggle}
					/>
				</Container>
			</Container>
		</ActionsContextProvider>
	);
};
