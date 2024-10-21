/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useEffect, useMemo, useRef } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useAppContext } from '@zextras/carbonio-shell-ui';
import { filter, orderBy } from 'lodash';
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

type RouteParams = {
	folderId: string;
};

type UseAppContextType = {
	setCount: (count: number) => void;
};

export const FolderPanel = (): ReactElement => {
	const isFirstRender = useRef(true);
	const { folderId } = useParams<RouteParams>();
	const dispatch = useAppDispatch();
	const folder = useFolder(folderId);
	const { setCount } = useAppContext<UseAppContextType>();
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);

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
					<ContactsList
						folderId={folderId}
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
