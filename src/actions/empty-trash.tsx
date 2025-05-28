/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isLink, isTrash } from '@zextras/carbonio-ui-commons';
import { isNestedInTrash } from '@zextras/carbonio-ui-commons';
import { Folder } from '@zextras/carbonio-ui-commons';
import { AddressBookEmptyModal } from '../components/modals/address-book-empty/address-book-empty';
import { ACTION_IDS } from '../constants';

export type EmptyTrashAction = UIAction<Folder, Folder>;

export const useActionEmptyTrash = (): EmptyTrashAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<EmptyTrashAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isNestedInTrash(addressBook)) {
				return false;
			}

			if (isLink(addressBook)) {
				return false;
			}

			if (!isTrash(addressBook.id)) {
				return false;
			}

			if (addressBook.n === 0) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<EmptyTrashAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}
			const modalId = 'empty-trash';
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
			id: ACTION_IDS.emptyTrash,
			label: t('folder.action.empty.trash', 'Empty trash'),
			icon: 'DeletePermanentlyOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
