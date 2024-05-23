/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isLink, isTrash } from '../carbonio-ui-commons/helpers/folders';
import { isNestedInTrash } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ContactsImportModal } from '../components/modals/contacts-import-modal';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

export type ImportContactsAction = UIAction<Folder, Folder>;

const parse = (str: string): Array<Array<{ aid: string }>> =>
	// eslint-disable-next-line no-new-func
	Function(`'use strict'; return (${str})`)();

export const requestFileSelection = (): Promise<File> =>
	new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = false;
		input.hidden = false;
		input.accept = '.csv, text/csv';
		input.click();
		input.onchange = (): void =>
			input.files && input.files.length > 0 ? resolve(input.files[0]) : reject();
		input.oncancel = (): void => reject();
	});

export const useActionImportContacts = (): ImportContactsAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const canExecute = useCallback<ImportContactsAction['canExecute']>(
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

			return true;
		},
		[]
	);

	const execute = useCallback<ImportContactsAction['execute']>(
		(addressBook) => {
			if (!canExecute(addressBook)) {
				return;
			}

			if (!addressBook) {
				return;
			}

			requestFileSelection().then((file): void => {
				const closeModal = createModal(
					{
						maxHeight: '90vh',
						children: (
							<StoreProvider>
								<ContactsImportModal
									addressBook={addressBook}
									file={file}
									closeCallback={() => closeModal()}
								/>
							</StoreProvider>
						)
					},
					true
				);
			});
		},
		[canExecute, createModal]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.importContacts,
			label: t('label.import_address_book', 'Import csv file'),
			icon: 'UploadOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
