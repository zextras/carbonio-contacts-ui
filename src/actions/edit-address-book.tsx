/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isTrash } from '@zextras/carbonio-ui-commons';
import { isNestedInTrash } from '@zextras/carbonio-ui-commons';
import { Folder } from '@zextras/carbonio-ui-commons';
import { AddressBookEditModal } from '../components/modals/address-book-edit/address-book-edit';
import { ACTION_IDS } from '../constants';

export type EditAddressBookAction = UIAction<Folder, Folder>;

export const useActionEditAddressBook = (): EditAddressBookAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<EditAddressBookAction['canExecute']>(
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

			return true;
		},
		[]
	);

	const execute = useCallback<EditAddressBookAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}
			const modalId = 'edit-address-book';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					children: (
						<AddressBookEditModal
							addressBookId={addressBook.id}
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
			id: ACTION_IDS.editAddressBook,
			label: t('folder.action.edit', 'Edit address book'),
			icon: 'Edit2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
