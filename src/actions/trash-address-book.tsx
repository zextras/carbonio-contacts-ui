/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { isLink, isSystemFolder, isNestedInTrash, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { UIAction } from 'actions/types';
import { AddressBookTrashModal } from 'components/modals/address-book-trash/address-book-trash';
import { ACTION_IDS } from 'constants/index';

export type TrashAddressBookAction = UIAction<Folder, Folder>;

export const useActionTrashAddressBook = (): TrashAddressBookAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const execute = useCallback<TrashAddressBookAction['execute']>(
		(addressBook) => {
			if (!addressBook) {
				return;
			}
			const modalId = 'trash-address-book';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					onClose: () => {
						closeModal(modalId);
					},
					children: (
						<AddressBookTrashModal
							addressBook={addressBook}
							onClose={(): void => closeModal(modalId)}
						/>
					)
				},
				true
			);
		},
		[closeModal, createModal]
	);

	const canExecute = useCallback<TrashAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isSystemFolder(addressBook.id)) {
				return false;
			}

			if (isLink(addressBook)) {
				return false;
			}

			return !isNestedInTrash(addressBook);
		},
		[]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.trashAddressBook,
			label: t('folder.action.delete', 'Delete address book'),
			icon: 'Trash2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
