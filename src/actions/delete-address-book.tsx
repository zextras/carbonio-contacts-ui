/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import {
	isDeleteAllowed,
	isSystemFolder,
	isNestedInTrash,
	Folder
} from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { UIAction } from 'actions/types';
import { AddressBookDeleteModal } from 'components/modals/address-book-delete/address-book-delete';
import { ACTION_IDS } from 'constants/index';

export type DeleteAddressBookAction = UIAction<Folder, Folder>;

export const useActionDeleteAddressBook = (): DeleteAddressBookAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<DeleteAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isSystemFolder(addressBook.id)) {
				return false;
			}

			if (!isDeleteAllowed(addressBook)) {
				return false;
			}

			return isNestedInTrash(addressBook);
		},
		[]
	);

	const execute = useCallback<DeleteAddressBookAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}

			const modalId = 'delete-address-book';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					onClose: () => {
						closeModal(modalId);
					},
					children: (
						<AddressBookDeleteModal
							addressBook={addressBook}
							onClose={(): void => closeModal(modalId)}
						/>
					)
				},
				true
			);
		},
		[canExecute, closeModal, createModal]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.deleteAddressBook,
			label: t('folder.action.delete_permanently', 'Delete address book permanently'),
			icon: 'Trash2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
