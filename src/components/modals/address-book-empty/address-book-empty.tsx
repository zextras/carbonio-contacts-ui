/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	Divider,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';

export type AddressBookEmptyModalProps = {
	addressBook: Folder;
	onClose: () => void;
};

export const AddressBookEmptyModal = ({
	addressBook,
	onClose
}: AddressBookEmptyModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isTrashFolder = useMemo(() => isTrash(addressBook.id), [addressBook.id]);

	const modalTitle = useMemo(
		() =>
			t('folder.modal.empty.title', {
				addressBookName: addressBook.name,
				defaultValue: 'Empty {{addressBookName}}'
			}),
		[addressBook.name, t]
	);

	const confirmButtonLabel = useMemo(() => t('label.empty', 'Empty'), [t]);

	const confirmationTextComponent = useMemo(
		() =>
			isTrashFolder ? (
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
			),
		[isTrashFolder, t]
	);

	const onConfirm = useCallback(() => {
		const successLabel = isTrashFolder
			? t('folder.snackbar.trash_empty', 'Trash folder emptied successfully')
			: t('folder.snackbar.folder_empty', 'Address book emptied successfully');
		apiClient
			.emptyFolder(addressBook.id)
			.then(() => {
				createSnackbar({
					key: `Empty-folder-success`,
					replace: true,
					type: 'info',
					label: successLabel,
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
				onClose();
			})
			.catch(() =>
				createSnackbar({
					key: `empty-folder-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				})
			);
	}, [addressBook.id, createSnackbar, isTrashFolder, onClose, t]);

	return (
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<Divider />
			<ModalBody>{confirmationTextComponent}</ModalBody>
			<Divider />
			<ModalFooter onConfirm={onConfirm} confirmLabel={confirmButtonLabel} confirmColor={'error'} />
		</>
	);
};
