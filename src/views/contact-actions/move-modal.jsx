/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';
import { Input, Container, Text } from '@zextras/carbonio-design-system';
import { filter, startsWith, reduce, isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useReplaceHistoryCallback, FOLDERS } from '@zextras/carbonio-shell-ui';
import ModalFooter from './commons/modal-footer';
import { ModalHeader } from '../secondary-bar/commons/modal-header';
import FolderItem from '../secondary-bar/commons/folder-item';
import { contactAction } from '../../store/actions/contact-action';
import { NewModal } from './new-modal';
import { selectFolders } from '../../store/selectors/folders';

export default function MoveModal({
	onClose,
	contactId,
	originID,
	folderId,
	contact,
	createSnackbar
}) {
	const dispatch = useDispatch();
	const folders = useSelector(selectFolders);
	const totalContacts = useMemo(() => reduce(folders, (ac, v) => ac + v.itemsCount, 0), [folders]);
	const currentFolder = useMemo(
		() => filter(folders, (f) => f.id === `${folderId}`),
		[folders, folderId]
	);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const [input, setInput] = useState('');
	const [folderDestination, setFolderDestination] = useState(currentFolder || {});
	const [isSameFolder, setIsSameFolder] = useState(false);
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const moveContact = useCallback(() => {
		if (folderDestination?.id !== folderId && folderDestination.id !== originID) {
			dispatch(
				contactAction({
					contactsIDs: [contactId],
					originID,
					destinationID: folderDestination.id || FOLDERS.USER_ROOT,
					op: 'move'
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: folderId === FOLDERS.TRASH ? 'restore' : 'move',
						replace: true,
						type: 'info',
						label:
							folderId === FOLDERS.TRASH
								? t('messages.snackbar.contact_restored', 'Contact restored')
								: t('messages.snackbar.contact_moved', 'Contact moved'),
						autoHideTimeout: 3000,
						actionLabel: t('action.goto_folder', 'Go to folder'),
						onActionClick: () => {
							replaceHistory(`/folder/${folderDestination.id || FOLDERS.USER_ROOT}`);
						}
					});
				} else {
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
			onClose();
		} else {
			setIsSameFolder(true);
		}
	}, [
		folderDestination.id,
		folderId,
		originID,
		dispatch,
		contactId,
		onClose,
		createSnackbar,
		t,
		replaceHistory
	]);

	const filterFromInput = useMemo(
		() =>
			filter(folders, (v) => {
				if (isEmpty(v)) {
					return false;
				}
				if (
					v.id === currentFolder.id ||
					v.id === currentFolder.parent ||
					v.id === FOLDERS.TRASH ||
					v.parent === FOLDERS.TRASH ||
					(v.absParent === currentFolder.absParent && v.level > currentFolder.level) ||
					(v.level + currentFolder.depth > 3 && v.level !== 0)
				) {
					return false;
				}
				return startsWith(v?.label?.toLowerCase(), input?.toLowerCase());
			}),
		[
			currentFolder.absParent,
			currentFolder.depth,
			currentFolder.id,
			currentFolder.level,
			currentFolder.parent,
			folders,
			input
		]
	);
	const nestFilteredFolders = useCallback(
		(items, id, results) =>
			reduce(
				filter(items, (item) => item.parent === id),
				(acc, item) => {
					const match = filter(results, (result) => result.id === item.id);
					if (match && match.length) {
						return [
							...acc,
							{
								...item,
								items: nestFilteredFolders(items, item.id, results),
								onClick: () => setFolderDestination(item),
								open: !!input.length,
								divider: true,
								background: folderDestination.id === item.id ? 'highlight' : undefined
							}
						];
					}
					if (match && !match.length) {
						return [...acc, ...nestFilteredFolders(items, item.id, results)];
					}
					return acc;
				},
				[]
			),
		[folderDestination.id, input.length]
	);

	const nestedData = useMemo(
		() => [
			{
				id: FOLDERS.USER_ROOT,
				label: '/Root',
				level: '0',
				open: true,
				items: nestFilteredFolders(folders, FOLDERS.USER_ROOT, filterFromInput),
				background: folderDestination.id === FOLDERS.USER_ROOT ? 'highlight' : undefined,
				onClick: () => setFolderDestination({ id: FOLDERS.CONTACTS })
			}
		],
		[filterFromInput, folderDestination.id, folders, nestFilteredFolders]
	);

	const toggleModal = useCallback(
		() => setShowNewFolderModal(!showNewFolderModal),
		[showNewFolderModal]
	);
	return (
		<>
			{showNewFolderModal ? (
				<NewModal
					onClose={onClose}
					goBack={toggleModal}
					currentFolder={currentFolder}
					folders={folders}
					folderId={folderId}
					originID={originID}
					dispatch={dispatch}
					contactId={contactId}
					t={t}
					totalContacts={totalContacts}
					createSnackbar={createSnackbar}
				/>
			) : (
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
				>
					<ModalHeader
						title={`${
							folderId === FOLDERS.TRASH ? t('label.restore', 'Restore') : t('label.move', 'Move')
						} ${contact.firstName} ${contact.lastName}'s contact`}
						onClose={onClose}
					/>
					<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
						<Container
							padding={{ vertical: 'small' }}
							mainAlignment="center"
							crossAlignment="flex-start"
						>
							<Text overflow="break-word">
								{t(
									'folder.modal.move.body.message3',
									'Select a folder to move the considered one to:'
								)}
							</Text>
						</Container>
						<Input
							inputName={currentFolder.label}
							label={t('folder.modal.move.input.filter', 'Filter address book')}
							backgroundColor="gray5"
							value={input}
							onChange={(e) => setInput(e.target.value)}
						/>

						<FolderItem folders={nestedData} />
						<Container
							padding={{ all: 'medium' }}
							mainAlignment="center"
							crossAlignment="flex-start"
						>
							{isSameFolder && <Text color="error">Cannot move to same folder</Text>}
						</Container>
						<ModalFooter
							onConfirm={moveContact}
							secondaryAction={toggleModal}
							secondaryBtnType="outlined"
							secondaryColor="primary"
							secondaryLabel={t('label.new_address_book', 'New address Book')}
							label={
								folderId === FOLDERS.TRASH ? t('label.restore', 'Restore') : t('label.move', 'Move')
							}
							disabled={!folderDestination.id || folderDestination.id === folderId}
							t={t}
						/>
					</Container>
				</Container>
			)}
		</>
	);
}
