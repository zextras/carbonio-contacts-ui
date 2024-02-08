/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useState } from 'react';

import {
	Accordion,
	AccordionItem,
	ButtonOld as Button,
	Container,
	Icon,
	Row,
	useModal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory } from '@zextras/carbonio-shell-ui';
import { filter, findIndex, isEqual, map, maxBy, remove, sortBy, uniqWith } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalWrapper from './commons/modal-wrapper';
import { DeleteModal } from './delete-modal';
import { EditModal } from './edit-modal';
import { EmptyModal } from './empty-modal';
import { MoveModal } from './move-modal';
import { NewModal } from './new-modal';
import ShareFolderModal from './share-folder-modal';
import { SharesModal } from './shares-modal';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';
import { getShareInfo } from '../../store/actions/get-share-info';
import { StoreProvider } from '../../store/redux';
import { selectFolders } from '../../store/selectors/folders';
import { FolderActionsType } from '../../types/folder';
import { setCustomComponent } from '../folder/accordion-custom-components';
import { CollapsedSideBarItems } from '../folder/collapsed-sidebar-items';

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
		style={{ padding: '0.5rem 1rem' }}
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
									<StoreProvider>
										<SharesModal
											folders={requiredFolders}
											onClose={() => closeModal()}
											createSnackbar={item?.context?.createSnackbar}
										/>
									</StoreProvider>
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
	<Row mainAlignment="flex-start" padding={{ horizontal: 'small' }} takeAvailableSpace>
		<Icon size="large" icon="ShareOutline" />
		<AccordionItem {...item} />
	</Row>
);

export default function Sidebar({ expanded }) {
	const dispatch = useAppDispatch();
	const folders = useAppSelector(selectFolders);
	const [modal, setModal] = useState('');
	const [currentFolder, setCurrentFolder] = useState();
	const [modalAccordions, setModalAccordions] = useState();
	const [t] = useTranslation();
	const [accordionItems, setAccordionItems] = useState([]);
	const [sideBarItems, setSidebarItems] = useState([]);
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	const tagsAccordionItems = useGetTagsAccordion();
	const divider = (idx) => ({ divider: true, id: `divider-${idx}` });
	useEffect(() => {
		const nestedFolders = nest(folders, '1', 1);
		const trashFolder = remove(nestedFolders, (c) => c.id === '3');
		const maxSystemFolderId = maxBy(nestedFolders, (item) =>
			Number(item.id) < FOLDERS.LAST_SYSTEM_FOLDER_POSITION ? Number(item.id) : 0
		).id;
		const accordions = sortBy(nestedFolders, (item) => Number(item.id));
		const maxSystemFolderIdIndex = findIndex(accordions, (item) => item.id === maxSystemFolderId);
		trashFolder[0] && accordions.splice(maxSystemFolderIdIndex + 1, 0, trashFolder[0]);
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
		// Remove those share folders which broken due to revoke the rights from folder owner
		remove(sharedItems, (item) => item.broken);
		setSidebarItems(temp);
		setAccordionItems(
			temp.concat(
				// FIXME restore when CDS-204 will be released
				// divider(1),
				{
					id: 'shares',
					label: t('share.shared_folders', 'Shared Address Books'),
					divider: false,
					CustomComponent: ShareLabel,
					items: sharedItems.concat({
						label: t('share.find_shares', 'Find Shares'),
						context: { dispatch, t, createModal, createSnackbar },
						CustomComponent: SharesItem
					})
				}
			)
		);
		setModalAccordions(temp);
	}, [folders, t, dispatch, createModal, createSnackbar, expanded]);

	return (
		<>
			{expanded ? (
				<>
					<Accordion items={accordionItems} activeId={currentFolder?.id} />
					<Accordion
						items={[
							// FIXME restore when CDS-204 will be released
							// divider(2),
							tagsAccordionItems
							// FIXME restore when CDS-204 will be released
							// , divider(3)
						]}
					/>
				</>
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
