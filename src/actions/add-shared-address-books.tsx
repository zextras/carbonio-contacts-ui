/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from 'actions/types';
import { SharedAddressBooksAddModal } from 'components/modals/shared-address-books-add/shared-address-books-add-modal';
import { ACTION_IDS } from 'constants/index';

export type AddSharedAddressBooksAction = UIAction<never, never>;

export const useActionAddSharedAddressBooks = (): AddSharedAddressBooksAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<AddSharedAddressBooksAction['canExecute']>(() => true, []);

	const execute = useCallback<AddSharedAddressBooksAction['execute']>(() => {
		const modalId = 'add-shared-address-books';
		createModal(
			{
				id: modalId,
				maxHeight: '90vh',
				onClose: () => {
					closeModal(modalId);
				},
				children: <SharedAddressBooksAddModal onClose={(): void => closeModal(modalId)} />
			},
			true
		);
	}, [closeModal, createModal]);

	return useMemo(
		() => ({
			id: ACTION_IDS.addSharedAddressBooks,
			label: t('action.add_shared_address_books', 'Add shares'),
			icon: '',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
