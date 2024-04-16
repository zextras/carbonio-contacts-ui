/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isSystemFolder } from '../carbonio-ui-commons/helpers/folders';
import { isNestedInTrash } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { AddressBookDeleteModal } from '../components/modals/address-book-delete/address-book-delete';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

export type DeleteAddressBookAction = UIAction<Folder, Folder>;

export const useActionDeleteAddressBook = (): DeleteAddressBookAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const execute = useCallback<DeleteAddressBookAction['execute']>(
		(addressBook) => {
			if (!addressBook) {
				return;
			}
			const closeModal = createModal(
				{
					children: (
						<StoreProvider>
							<AddressBookDeleteModal addressBook={addressBook} onClose={() => closeModal()} />
						</StoreProvider>
					)
				},
				true
			);
		},
		[createModal]
	);

	const canExecute = useCallback<DeleteAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isSystemFolder(addressBook.id)) {
				return false;
			}

			if (addressBook.isLink) {
				return false;
			}

			return isNestedInTrash(addressBook);
		},
		[]
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
