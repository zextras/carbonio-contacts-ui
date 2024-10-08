/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isLink, isTrash } from '../carbonio-ui-commons/helpers/folders';
import { isNestedInTrash } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { apiClient } from '../network/api-client';

export type ExportAddressBookAction = UIAction<Folder, Folder>;

const redirectToBlob = (content: string, fileName: string): void => {
	const blob = new Blob([content], { type: 'application/csv' });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${fileName}.csv`;
	a.click();
	window.URL.revokeObjectURL(url);
};

export const useActionExportAddressBook = (): ExportAddressBookAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback<ExportAddressBookAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			if (isLink(addressBook)) {
				return false;
			}

			if (isTrash(addressBook.id)) {
				return false;
			}

			if (isNestedInTrash(addressBook)) {
				return false;
			}

			if (addressBook.n === 0) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<ExportAddressBookAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}

			apiClient
				.exportContacts(addressBook.id)
				.then((content) => {
					redirectToBlob(content, addressBook.name);
				})
				.catch(() => {
					createSnackbar({
						key: 'export-address-book-error',
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				});
		},
		[canExecute, createSnackbar, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.exportAddressBook,
			label: t('label.export_address_book', 'Export csv file'),
			icon: 'DownloadOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
