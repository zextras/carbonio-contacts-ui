/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { every } from 'lodash';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isTrashed } from '../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ContactMoveModal } from '../components/modals/contact-move';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

export type RestoreContactsAction = UIAction<
	{ contacts?: Array<Contact> },
	{ contacts?: Array<Contact> }
>;

export const useActionRestoreContacts = (): RestoreContactsAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<RestoreContactsAction['canExecute']>(
		({ contacts } = {}): boolean => {
			if (!contacts || contacts.length === 0) {
				return false;
			}

			const parentAddressBooks = contacts.reduce<Array<Folder>>((result, contact) => {
				const folder = getFolder(contact.parent);
				if (folder) {
					result.push(folder);
				}

				return result;
			}, []);

			return every(parentAddressBooks, (addressBook) => isTrashed({ folder: addressBook }));
		},
		[]
	);

	const execute = useCallback<RestoreContactsAction['execute']>(
		({ contacts } = {}) => {
			if (!contacts || contacts.length === 0) {
				return;
			}

			if (!canExecute({ contacts })) {
				return;
			}

			const contactsIds = contacts.map((contact) => contact.id);

			const modalId = 'restore-contacts';
			createModal(
				{
					id: modalId,
					children: (
						<ContactMoveModal
							mode={'restore'}
							contacts={contacts}
							onMove={(parentAddressBookId): Promise<void> =>
								apiClient
									.moveContact(contactsIds, parentAddressBookId)
									.then((): void => {
										createSnackbar({
											key: `restore-contacts-success`,
											replace: true,
											severity: 'success',
											label: t('messages.snackbar.contact_restored', 'Contacts restored'),
											autoHideTimeout: TIMEOUTS.defaultSnackbar,
											hideButton: true
										});
										closeModal(modalId);
									})
									.catch(() => {
										createSnackbar({
											key: `restore-contacts-error`,
											replace: true,
											severity: 'error',
											label: t('label.error_try_again', 'Something went wrong, please try again'),
											autoHideTimeout: TIMEOUTS.defaultSnackbar,
											hideButton: true
										});
									})
							}
							onClose={(): void => closeModal(modalId)}
						/>
					)
				},
				true
			);
		},
		[canExecute, closeModal, createModal, createSnackbar, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.restoreContacts,
			label: t('label.restore', 'Restore'),
			icon: 'RestoreOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
