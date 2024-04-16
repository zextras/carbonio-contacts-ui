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
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

export type EmptyAddressBookAction = UIAction<Folder, Folder>;

export const useActionEmptyAddressBook = (): EmptyAddressBookAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const execute = useCallback<EmptyAddressBookAction['execute']>(
		(addressBook) => {
			if (!addressBook) {
				return;
			}
			const closeModal = createModal(
				{
					children: (
						<StoreProvider>
							<AddressBookEmptyModal addressBook={addressBook} onClose={() => closeModal()} />
						</StoreProvider>
					)
				},
				true
			);
		},
		[createModal]
	);

	const canExecute = useCallback<EmptyAddressBookAction['canExecute']>(
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
			id: ACTION_IDS.emptyAddressBook,
			label: t('folder.action.empty', 'Empty address book'),
			icon: 'EmptyFolderOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
