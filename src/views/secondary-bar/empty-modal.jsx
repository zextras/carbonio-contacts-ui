/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import { Text, Container, CustomModal } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/zapp-shell';
import ModalFooter from '../contact-actions/commons/modal-footer';
import { folderAction } from '../../store/actions/folder-action';
import { ModalHeader } from './commons/modal-header';
import { contactAction } from '../../store/actions/contact-action';

export const EmptyModal = ({ currentFolder, openModal, setModal, dispatch, t, createSnackbar }) => {
	const onConfirm = useCallback(() => {
		if (currentFolder.id === FOLDERS.TRASH) {
			dispatch(folderAction({ folder: currentFolder, op: 'empty', recursive: true })).then(
				(res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `empty`,
							replace: true,
							type: 'info',
							label: t('folder.snackbar.trash_empty', 'Trash folder emptied successfully'),
							autoHideTimeout: 3000,
							hideButton: true
						});
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
				}
			);
		} else {
			dispatch(
				contactAction({
					contactsIDs: currentFolder.cn[0].ids.split(','),
					originID: currentFolder.id,
					destinationID: currentFolder.parent === FOLDERS.TRASH ? undefined : FOLDERS.TRASH,
					op: currentFolder.parent === FOLDERS.TRASH ? 'delete' : 'move'
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `empty`,
						replace: true,
						type: 'info',
						label: t('folder.snackbar.folder_empty', 'Address book emptied successfullly'),
						autoHideTimeout: 3000,
						hideButton: true
					});
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
		}
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
					<Text overflow="break-word">
						{t(
							'folder.modal.empty.body.message1',
							'Do you want to empty the selected address book?'
						)}{' '}
						<br />
						{t(
							'folder.modal.empty.body.message2',
							'If you empty it, all the related content will be moved to trash.'
						)}
					</Text>
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
