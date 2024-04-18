/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	ModalBody,
	ModalFooter,
	ModalHeader,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';

export type AddressBookTrashModalProps = {
	addressBook: Folder;
	onClose: () => void;
};

export const AddressBookTrashModal = ({
	addressBook,
	onClose
}: AddressBookTrashModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const modalTitle = useMemo(
		() =>
			t('folder.modal.delete.title', {
				addressBookName: addressBook.name,
				defaultValue: 'Delete {{addressBookName}}'
			}),
		[addressBook.name, t]
	);

	const confirmButtonLabel = useMemo(() => t('label.delete', 'Delete'), [t]);

	const confirmationText = useMemo(
		() =>
			t(
				'folder.modal.delete.body.message1',
				'Do you want to delete the selected address book? If you delete it, the related content will be permanently removed and the address book will no longer be recoverable.'
			),
		[t]
	);

	const onRestore = useCallback(() => {
		if (!addressBook.l) {
			return;
		}

		apiClient
			.moveFolder(addressBook.id, addressBook.l)
			.then(() => {
				createSnackbar({
					key: `restore-folder-success`,
					replace: true,
					type: 'success',
					label: t('label.address_book_restored', 'Address book restored'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			})
			.catch(() => {
				createSnackbar({
					key: `restore-folder-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [addressBook.id, addressBook.l, createSnackbar, t]);

	const onConfirm = useCallback(() => {
		apiClient
			.trashFolder(addressBook.id)
			.then(() => {
				createSnackbar({
					key: `delete-folder-success`,
					replace: true,
					type: 'info',
					label: t('folder.snackbar.address_book_moved_to_trash', 'Address book moved to trash'),
					autoHideTimeout: TIMEOUTS.trashAddressBook,
					hideButton: false,
					actionLabel: t('label.undo', 'Undo'),
					onActionClick: onRestore
				});
				onClose();
			})
			.catch(() =>
				createSnackbar({
					key: `delete-folder-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				})
			);
	}, [addressBook.id, createSnackbar, onClose, onRestore, t]);

	return (
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<ModalBody>
				<Text overflow="break-word">{confirmationText}</Text>
			</ModalBody>
			<ModalFooter onConfirm={onConfirm} confirmLabel={confirmButtonLabel} confirmColor={'error'} />
		</>
	);
};
