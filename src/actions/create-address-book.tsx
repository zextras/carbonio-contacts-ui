/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { isCreateAllowed, isTrash, isNestedInTrash, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { AddressBookCreateModal } from '../components/modals/address-book-create';
import { ACTION_IDS } from '../constants';

export type CreateAddressBookAction = UIAction<Folder | undefined, Folder | undefined>;

export const useActionCreateAddressBook = (): CreateAddressBookAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<CreateAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return true;
			}

			if (isNestedInTrash(addressBook)) {
				return false;
			}

			if (isTrash(addressBook.id)) {
				return false;
			}

			if (!isCreateAllowed(addressBook)) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<CreateAddressBookAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			const modalId = 'create-address-book';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					size: 'medium',
					children: (
						<AddressBookCreateModal
							defaultParentId={addressBook?.id}
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
			id: ACTION_IDS.createAddressBook,
			label: t('label.new_address_book', 'New address book'),
			icon: 'AddressBookOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
