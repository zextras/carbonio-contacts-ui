/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isSystemFolder, isWriteAllowed } from '../carbonio-ui-commons/helpers/folders';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { AddressBookMoveModal } from '../components/modals/address-book-move';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { apiClient } from '../network/api-client';

export type MoveAddressBookAction = UIAction<
	{ addressBook?: Folder; newParentAddressBook?: Folder },
	{ addressBook?: Folder; newParentAddressBook?: Folder }
>;

export const useActionMoveAddressBook = (): MoveAddressBookAction => {
	const [t] = useTranslation();
	const createModal = useModal();
	const createSnackbar = useSnackbar();

	const move = useCallback(
		(addressBookId: string, parentAddressBookId: string) =>
			apiClient
				.moveFolder(addressBookId, parentAddressBookId)
				.then(() => {
					createSnackbar({
						key: `move-address-book-success`,
						replace: true,
						type: 'success',
						label: t('folder.action.moved', 'Address book moved successfully'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					return true;
				})
				.catch(() => {
					createSnackbar({
						key: `move-address-book-error`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					return false;
				}),
		[createSnackbar, t]
	);

	const canExecute = useCallback<MoveAddressBookAction['canExecute']>(
		({ addressBook, newParentAddressBook } = {}): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isSystemFolder(addressBook.id)) {
				return false;
			}

			if (addressBook.isLink) {
				return false;
			}

			if (newParentAddressBook && !isWriteAllowed(newParentAddressBook)) {
				return false;
			}

			if (newParentAddressBook?.id === addressBook.l) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<MoveAddressBookAction['execute']>(
		({ addressBook, newParentAddressBook } = {}) => {
			if (!addressBook) {
				return;
			}

			if (!canExecute({ addressBook, newParentAddressBook })) {
				return;
			}

			if (newParentAddressBook) {
				move(addressBook.id, newParentAddressBook.id);
			} else {
				const closeModal = createModal(
					{
						children: (
							<AddressBookMoveModal
								addressBookId={addressBook.id}
								onMove={(parentAddressBookId) => {
									move(addressBook.id, parentAddressBookId).then(
										(success) => success && closeModal()
									);
								}}
								onClose={() => closeModal()}
							/>
						)
					},
					true
				);
			}
		},
		[canExecute, createModal, move]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.moveAddressBook,
			label: t('folder.action.move', 'Move'),
			icon: 'MoveOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
