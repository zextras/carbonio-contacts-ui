/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container } from '@zextras/carbonio-design-system';
import { useAppContext } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { State } from '../../types/store';
import { ActionsContextProvider } from '../../ui-actions/actions-context';
import { ContactsList } from './folder-panel/contacts-list';
import { selectAllContactsInFolder, selectFolderStatus } from '../../store/selectors/contacts';
import { searchContacts } from '../../store/actions/search-contacts';
import { useSelection } from '../../hooks/useSelection';
import { selectFolder } from '../../store/selectors/folders';
import { Breadcrumbs } from './breadcrumbs';
import { SelectPanelActions } from '../folder/select-panel-actions';

type RouteParams = {
	folderId: string;
};

export default function FolderPanel(): ReactElement {
	const { folderId } = useParams<RouteParams>();
	const dispatch = useDispatch();
	const folder = useSelector((state: State) => selectFolder(state, folderId));
	const folderStatus = useSelector((state: State) => selectFolderStatus(state, folderId));
	const { setCount } = useAppContext();
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);

	const contacts = useSelector((state: State) => selectAllContactsInFolder(state, folderId));
	const ids = useMemo(() => Object.keys(selected ?? []), [selected]);
	const selectedContacts = filter(contacts, (contact) => ids.indexOf(contact.id) !== -1);

	useEffect(() => {
		if (!folderStatus) {
			dispatch(searchContacts(folderId));
		}
	}, [dispatch, folderId, folderStatus]);

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
				background="gray6"
				borderRadius="none"
				style={{
					maxHeight: '100%'
				}}
			>
				<Container mainAlignment="flex-start" borderRadius="none" height="calc(100% - 64px)">
					{isSelecting ? (
						<SelectPanelActions
							folderId={folderId}
							dispatch={dispatch}
							deselectAll={deselectAll}
							selectedIDs={selected}
						/>
					) : (
						<Breadcrumbs folderPath={folder?.path} itemsCount={folder?.itemsCount} />
					)}
					<ContactsList
						folderId={folderId}
						contacts={contacts}
						selected={selected}
						setCount={setCount}
						toggle={toggle}
					/>
				</Container>
			</Container>
		</ActionsContextProvider>
	);
}
