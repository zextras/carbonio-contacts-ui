/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { filter, find, isEqual, map, remove, sortBy, uniqWith } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
	Accordion,
	AccordionItem,
	Button,
	Container,
	Icon,
	ModalManagerContext,
	Padding,
	Row,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';
import { setCustomComponent } from '../folder/accordion-custom-components';
import { FolderActionsType } from '../../types/folder';
import { NewModal } from './new-modal';
import { DeleteModal } from './delete-modal';
import { EditModal } from './edit-modal';
import { MoveModal } from './move-modal';
import { EmptyModal } from './empty-modal';
import { selectFolders } from '../../store/selectors/folders';
import { SharesModal } from './shares-modal';
import { getShareInfo } from '../../store/actions/get-share-info';
import ShareFolderModal from './share-folder-modal';
import ModalWrapper from './commons/modal-wrapper';
import { CollapsedSideBarItems } from '../folder/collapsed-sidebar-items';
import { selectAllContacts, selectAllContactsInFolder } from '../../store/selectors/contacts';

export const nest = (items, id, level) =>
	map(
		filter(items, (item) => item.parent === id),
		(item) => ({
			...item,
			divider: false,
			items: nest(items, item.id, level + 1),
			to: `/folder/${item.id}`
		})
	);

const SharesItem = ({ item }) => (
	<Container
		width="fill"
		mainAlignment="center"
		orientation="horizontal"
		style={{ padding: '8px 16px' }}
	>
		<Button
			type="outlined"
			label={item.label}
			color="primary"
			size="fill"
			onClick={(ev) => {
				ev.stopPropagation();
				item?.context?.dispatch(getShareInfo()).then((res) => {
					if (res.type.includes('fulfilled')) {
						const folders = uniqWith(
							filter(res?.payload?.share ?? [], ['view', 'contact']),
							isEqual
						);

						// eslint-disable-next-line consistent-return
						const requiredFolders = filter(folders, (v) => {
							if (v.ownerName) {
								return v;
							}
						});
						const closeModal = item.context.createModal(
							{
								children: (
									<>
										<SharesModal
											folders={requiredFolders}
											onClose={() => closeModal()}
											createSnackbar={item?.context?.createSnackbar}
										/>
									</>
								)
							},
							true
						);
					}
				});
			}}
		/>
	</Container>
);

const ShareLabel = (item) => (
	<Row mainAlignment="flex-start" padding={{ horizontal: 'large' }} takeAvailableSpace>
		<Icon size="large" icon="ShareOutline" /> <Padding right="large" />
		<AccordionItem {...item} height={40} />
	</Row>
);

export default function Sidebar({ expanded }) {
	const dispatch = useDispatch();
	const folders = useSelector(selectFolders);
	const [modal, setModal] = useState('');
	const [currentFolder, setCurrentFolder] = useState();
	const contacts = useSelector(selectAllContacts);
	const [modalAccordions, setModalAccordions] = useState();
	const [t] = useTranslation();
	const [accordionItems, setAccordionItems] = useState([]);
	const [sideBarItems, setSidebarItems] = useState([]);
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);
	const replaceHistory = useReplaceHistoryCallback();

	useEffect(() => {
		const nestedFolders = nest(folders, '1', 1);
		const trashFolder = remove(nestedFolders, (c) => c.id === '3');
		const accordions = sortBy(nestedFolders, (item) => Number(item.id)).concat(trashFolder);
		const temp = setCustomComponent(
			accordions,
			setModal,
			setCurrentFolder,
			t,
			'',
			dispatch,
			createModal,
			createSnackbar,
			replaceHistory
		);
		const sharedItems = remove(temp, 'owner');
		setSidebarItems(temp);
		setAccordionItems(
			temp.concat({
				id: 'shares',
				label: t('share.shared_folders', 'Shared Address Books'),
				divider: true,
				CustomComponent: ShareLabel,
				items: sharedItems.concat({
					label: t('share.find_shares', 'Find Shares'),
					context: { dispatch, t, createModal, createSnackbar },
					CustomComponent: SharesItem
				})
			})
		);

		setModalAccordions(temp);
	}, [folders, t, dispatch, createModal, createSnackbar, expanded, replaceHistory]);

	useEffect(() => {
		console.clear();
		console.log(folders);
		console.log(contacts);
		console.log('current', currentFolder);
	}, [contacts, currentFolder, folders]);

	return (
		<>
			{expanded ? (
				<Accordion items={accordionItems} />
			) : (
				sideBarItems.map((folder, index) => <CollapsedSideBarItems key={index} folder={folder} />)
			)}
			{currentFolder && (
				<>
					<NewModal
						openModal={modal === FolderActionsType.NEW}
						currentFolder={currentFolder}
						folders={folders}
						setModal={setModal}
						dispatch={dispatch}
						t={t}
						createSnackbar={createSnackbar}
					/>
					<MoveModal
						currentFolder={currentFolder}
						folders={folders}
						openModal={modal === FolderActionsType.MOVE}
						setModal={setModal}
						dispatch={dispatch}
						t={t}
						createSnackbar={createSnackbar}
					/>
					<EmptyModal
						currentFolder={currentFolder}
						openModal={modal === FolderActionsType.EMPTY}
						setModal={setModal}
						dispatch={dispatch}
						t={t}
						createSnackbar={createSnackbar}
					/>
					<DeleteModal
						currentFolder={currentFolder}
						accordions={modalAccordions}
						openModal={modal === FolderActionsType.DELETE}
						setModal={setModal}
						dispatch={dispatch}
						t={t}
						createSnackbar={createSnackbar}
					/>
					{modal === FolderActionsType.EDIT && (
						<EditModal
							currentFolder={currentFolder}
							accordions={modalAccordions}
							openModal={modal === FolderActionsType.EDIT}
							setModal={setModal}
							dispatch={dispatch}
							t={t}
							createSnackbar={createSnackbar}
						/>
					)}
					{modal === 'share' && (
						<ModalWrapper open={modal === 'share'}>
							<ShareFolderModal
								openModal={modal === 'share'}
								folder={currentFolder}
								setModal={setModal}
								dispatch={dispatch}
								t={t}
								createSnackbar={createSnackbar}
							/>
						</ModalWrapper>
					)}
				</>
			)}
		</>
	);
}
