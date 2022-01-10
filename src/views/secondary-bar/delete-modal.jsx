/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import { Container, CustomModal, Text } from '@zextras/zapp-ui';
import { useReplaceHistoryCallback, report, FOLDERS } from '@zextras/zapp-shell';
import ModalFooter from '../contact-actions/commons/modal-footer';
import { ModalHeader } from './commons/modal-header';
import { folderAction } from '../../store/actions/folder-action';

export const DeleteModal = ({
	currentFolder,
	openModal,
	setModal,
	dispatch,
	t,
	createSnackbar
}) => {
	const replaceHistory = useReplaceHistoryCallback();

	const onConfirm = useCallback(() => {
		const restoreFolder = () => {
			dispatch(folderAction({ folder: currentFolder, l: currentFolder.parent, op: 'move' })).then(
				(res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `restore_folder`,
							replace: true,
							type: 'success',
							label: t('label.address_book_restored', 'Address book restored'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
					if (!res.type.includes('fulfilled')) {
						createSnackbar({
							key: `delete`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				}
			);
		};
		if (currentFolder.absParent !== FOLDERS.TRASH) {
			dispatch(folderAction({ folder: currentFolder, op: 'trash' }))
				.then((res) => {
					if (!res.error) {
						createSnackbar({
							key: `trash`,
							replace: true,
							type: 'info',
							label: t(
								'folder.snackbar.address_book_moved_to_trash',
								'Address book moved to trash'
							),
							autoHideTimeout: 5000,
							hideButton: false,
							actionLabel: 'Undo',
							onActionClick: () => restoreFolder()
						});
					} else if (!res.type.includes('fulfilled')) {
						createSnackbar({
							key: `delete`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				})
				.catch(report);
		} else {
			dispatch(folderAction({ folder: currentFolder, l: FOLDERS.TRASH, op: 'delete' }))
				.then((res) => {
					if (!res.error) {
						createSnackbar({
							key: `trash`,
							replace: true,
							type: 'info',
							label: t(
								'folder.snackbar.address_book_permanently_deleted',
								'Address book permanently deleted'
							),
							autoHideTimeout: 3000,
							hideButton: true
						});
					} else if (!res.type.includes('fulfilled')) {
						createSnackbar({
							key: `delete`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				})
				.catch(report);
		}

		setModal('');
	}, [createSnackbar, currentFolder, dispatch, setModal, t]);

	const onClose = useCallback(() => setModal(''), [setModal]);

	return currentFolder ? (
		<CustomModal open={openModal} onClose={onClose} maxHeight="90vh">
			<Container
				padding={{ all: 'large' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader
					onClose={onClose}
					title={`${t('label.delete', 'Delete')} ${currentFolder.label}`}
				/>
				<Container
					padding={{ all: 'small' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
				>
					<Text overflow="break-word">
						{currentFolder.absParent === FOLDERS.TRASH
							? t(
									'folder.modal.delete.body.message2',
									'Do you want to delete permanently the selected address book? If you delete it, the related content will be permanently removed and the address book will no longer be recoverable.'
							  )
							: t(
									'folder.modal.delete.body.message1',
									'Do you want to delete the selected address book? If you delete it, the related content will be permanently removed and the address book will no longer be recoverable.'
							  )}
					</Text>
					<ModalFooter
						onConfirm={onConfirm}
						label={t('label.delete', 'Delete')}
						t={t}
						background="error"
					/>
				</Container>
			</Container>
		</CustomModal>
	) : (
		<></>
	);
};
