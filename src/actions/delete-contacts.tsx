/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { every } from 'lodash';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isTrashed } from '../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types';
import { ContactsDeleteModal } from '../components/modals/contacts-delete';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';
import { Contact } from '../legacy/types/contact';

export type ActionDeleteContacts = UIAction<Array<Contact>, Array<Contact>>;
export const useActionDeleteContacts = (): ActionDeleteContacts => {
	const [t] = useTranslation();
	const createModal = useModal();

	const canExecute = useCallback<ActionDeleteContacts['canExecute']>((contacts): boolean => {
		if (!contacts || contacts.length === 0) return false;
		const parentContacts = contacts.reduce<Array<Folder>>((result, contact) => {
			const folder = getFolder(contact.parent);
			if (folder) {
				result.push(folder);
			}

			return result;
		}, []);
		if (parentContacts.length === 0) return false;
		return every(parentContacts, (cont) => isTrashed({ folder: cont }));
	}, []);

	const execute = useCallback<ActionDeleteContacts['execute']>(
		(contacts) => {
			if (!contacts) return;
			if (!canExecute(contacts)) return;
			const closeModal = createModal(
				{
					maxHeight: '90vh',
					children: (
						<StoreProvider>
							<ContactsDeleteModal contacts={contacts} onClose={(): void => closeModal()} />
						</StoreProvider>
					)
				},
				true
			);
		},
		[canExecute, createModal]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.deleteContacts,
			label: t('folder.action.delete_permanently', 'Delete contacts permanently'),
			icon: 'DeletePermanentlyOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
