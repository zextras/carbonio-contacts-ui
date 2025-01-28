/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';

import { Container, Select } from '@zextras/carbonio-design-system';
import { useAppContext } from '@zextras/carbonio-shell-ui';
import { filter, find, orderBy } from 'lodash';
import { useParams } from 'react-router-dom';

import { Breadcrumbs } from './breadcrumbs';
import { ContactsList } from './folder-panel/contacts-list';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useSelection } from '../../hooks/useSelection';
import { searchContactsAsyncThunk } from '../../store/actions/search-contacts';
import { selectAllContactsInFolder, selectContactsStatus } from '../../store/selectors/contacts';
import { ActionsContextProvider } from '../../ui-actions/actions-context';
import { SelectPanelActions } from '../folder/select-panel-actions';
import { ContactGroupList } from './folder-panel/contact-groups-list';
import { useTranslation } from 'react-i18next';

type RouteParams = {
	folderId: string;
};

type UseAppContextType = {
	setCount: (count: number) => void;
};

const FILTER_TYPES = {
	CONTACT: 'CONTACT',
	CONTACT_GROUP: 'CONTACT-GROUP'
};

export const FolderPanel = (): ReactElement => {
	const [t] = useTranslation();
	const isFirstRender = useRef(true);
	const { folderId } = useParams<RouteParams>();
	const dispatch = useAppDispatch();
	const folder = useFolder(folderId);
	const { setCount } = useAppContext<UseAppContextType>();
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);
	const [activeFilter, setActiveFilter] = useState(FILTER_TYPES.CONTACT);
	const contacts = useAppSelector((state) => selectAllContactsInFolder(state, folderId));
	const searchRequestStatus = useAppSelector((state) => selectContactsStatus(state, folderId));
	const sortedContacts = useMemo(
		() =>
			orderBy(
				contacts,
				[
					(item): string =>
						item?.firstName?.toLowerCase() ||
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
		if (!isFirstRender.current || searchRequestStatus !== undefined) {
			return;
		}
		dispatch(searchContactsAsyncThunk({ folderId })).finally(() => {
			isFirstRender.current = false;
		});
	}, [dispatch, folderId, searchRequestStatus]);

	const selectOptions = [
		{ label: t('folder_panel.option.contacts', 'Contacts'), value: FILTER_TYPES.CONTACT },
		{
			label: t('folder_panel.option.contact_group', 'Contact Groups'),
			value: FILTER_TYPES.CONTACT_GROUP
		}
	];
	return (
		<ActionsContextProvider
			folderId={folderId}
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
						<Breadcrumbs folderPath={folder?.absFolderPath ?? ''} itemsCount={folder?.n ?? 0} />
					)}
					<Select
						items={selectOptions}
						label={t('label.filter_mode', 'Filter mode')}
						onChange={(value): void => {
							value && setActiveFilter(value);
						}}
						defaultSelection={find(selectOptions, ['value', activeFilter])}
					/>
					{activeFilter === FILTER_TYPES.CONTACT ? (
						<ContactsList
							folderId={folderId}
							contacts={sortedContacts}
							selected={selected}
							isSelecting={isSelecting}
							toggle={toggle}
						/>
					) : (
						<ContactGroupList />
					)}
				</Container>
			</Container>
		</ActionsContextProvider>
	);
};
