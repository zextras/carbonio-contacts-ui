/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { isLink, isTrash, isNestedInTrash, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { UIAction } from 'actions/types';
import { AddressBookEmptyModal } from 'components/modals/address-book-empty/address-book-empty';
import { ACTION_IDS } from 'constants/index';

export type EmptyAddressBookAction = UIAction<Folder, Folder>;

export const useActionEmptyAddressBook = (): EmptyAddressBookAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<EmptyAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isNestedInTrash(addressBook)) {
				return false;
			}

			if (isTrash(addressBook.id)) {
				return false;
			}

			if (isLink(addressBook)) {
				return false;
			}

			if (addressBook.n === 0) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<EmptyAddressBookAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}
			const modalId = 'empty-address-book';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					children: (
						<AddressBookEmptyModal
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
			id: ACTION_IDS.emptyAddressBook,
			label: t('folder.action.empty.folder', 'Empty address book'),
			icon: 'EmptyFolderOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
