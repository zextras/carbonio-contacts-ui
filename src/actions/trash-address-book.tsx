/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isLink, isSystemFolder } from '../carbonio-ui-commons/helpers/folders';
import { isNestedInTrash } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { AddressBookTrashModal } from '../components/modals/address-book-trash/address-book-trash';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

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
					children: (
						<StoreProvider>
							<AddressBookTrashModal
								addressBook={addressBook}
								onClose={(): void => closeModal(modalId)}
							/>
						</StoreProvider>
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
