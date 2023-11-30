/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import { Text, Container, CustomModal } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import ModalFooter from '../contact-actions/commons/modal-footer';
import { folderAction } from '../../store/actions/folder-action';
import { ModalHeader } from './commons/modal-header';
import { searchContacts } from '../../store/actions/search-contacts';

export const EmptyModal = ({ currentFolder, openModal, setModal, dispatch, t, createSnackbar }) => {
	const onConfirm = useCallback(() => {
		dispatch(folderAction({ folder: currentFolder, op: 'empty', recursive: true })).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `empty`,
					replace: true,
					type: 'info',
					label:
						currentFolder.id === FOLDERS.TRASH
							? t('folder.snackbar.trash_empty', 'Trash folder emptied successfully')
							: t('folder.snackbar.folder_empty', 'Address book emptied successfullly'),
					autoHideTimeout: 3000,
					hideButton: true
				});
				dispatch(searchContacts(currentFolder.id));
			} else {
				createSnackbar({
					key: `empty`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
		setModal('');
	}, [createSnackbar, currentFolder, dispatch, setModal, t]);
	const onClose = () => setModal('');

	return (
		<CustomModal open={openModal} onClose={onClose}>
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader
					title={`${t('label.empty', 'Empty')} ${currentFolder.label}`}
					onClose={onClose}
				/>
				<Container padding={{ top: 'large', bottom: 'large' }} crossAlignment="flex-start">
					{currentFolder.id === FOLDERS.TRASH ? (
						<Text overflow="break-word">
							{t('folder.modal.empty.message3', 'Do you want to empty the trash?')}
							<br />
							{t(
								'folder.modal.empty.message4',
								`Its content will be permanently deleted and it won't be possible to recover it.`
							)}
						</Text>
					) : (
						<Text overflow="break-word">
							{t('folder.modal.empty.message1', 'Do you want to empty the selected address book?')}
							<br />
							{t(
								'folder.modal.empty.message2',
								`All the related contacts will be permanently deleted and it won't be possible to recover them.`
							)}
						</Text>
					)}
				</Container>

				<ModalFooter
					onConfirm={onConfirm}
					onClose={onClose}
					label={t('label.empty', 'Empty')}
					t={t}
					background="error"
				/>
			</Container>
		</CustomModal>
	);
};
