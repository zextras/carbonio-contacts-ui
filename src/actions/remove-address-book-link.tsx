/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { ShowShareInfoAction } from './show-share-info';
import { UIAction } from './types';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { apiClient } from '../network/api-client';

export type RemoveAddressBookLinkAction = UIAction<Folder, Folder>;

export const useActionRemoveAddressBookLink = (): RemoveAddressBookLinkAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback<ShowShareInfoAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			return addressBook.isLink;
		},
		[]
	);

	const execute = useCallback<RemoveAddressBookLinkAction['execute']>(
		(addressBook) => {
			if (!addressBook) {
				return;
			}

			if (!canExecute(addressBook)) {
				return;
			}

			apiClient
				.deleteFolder(addressBook.id)
				.then(() => {
					createSnackbar({
						key: `remove-address-book-link-success`,
						replace: true,
						type: 'info',
						hideButton: true,
						label: t('share.share_removed_succesfully', 'Shared removed successfully'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar
					});
				})
				.catch(() => {
					createSnackbar({
						key: `remove-address-book-link-error`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar
					});
				});
		},
		[canExecute, createSnackbar, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.removeAddressBookLink,
			label: t('share.remove_from_this_list', 'Remove from this list'),
			icon: 'CloseOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
