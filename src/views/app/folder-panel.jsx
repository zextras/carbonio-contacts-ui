/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container } from '@zextras/zapp-ui';
import { useAppContext } from '@zextras/zapp-shell';
import { ActionsContextProvider } from '../../ui-actions/actions-context';
import { ContactsList } from './folder-panel/contacts-list';
import { selectAllContactsInFolder, selectFolderStatus } from '../../store/selectors/contacts';
import { searchContacts } from '../../store/actions/search-contacts';
import { useSelection } from '../../hooks/useSelection';
import { selectFolder } from '../../store/selectors/folders';
import { Breadcrumbs } from './breadcrumbs';
import SelectPanelAction from '../folder/select-panel-actions';

export default function FolderPanel() {
	const { folderId } = useParams();
	const dispatch = useDispatch();
	const folder = useSelector((state) => selectFolder(state, folderId));
	const folderStatus = useSelector((state) => selectFolderStatus(state, folderId));
	const { setCount } = useAppContext();
	const { selected, isSelecting, toggle, deselectAll } = useSelection(folderId, setCount);

	const contacts = useSelector((state) => selectAllContactsInFolder(state, folderId));

	useEffect(() => {
		if (!folderStatus) {
			dispatch(searchContacts(folderId));
		}
	}, [dispatch, folderId, folderStatus]);

	return (
		<ActionsContextProvider folderId={folderId} deselectAll={deselectAll} selectedIds={selected}>
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
						<SelectPanelAction
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
