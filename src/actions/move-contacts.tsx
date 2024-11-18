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
import { isRoot, isTrashed, isWriteAllowed } from '../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ContactMoveModal } from '../components/modals/contact-move';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

export type MoveContactsAction = UIAction<
	{ contacts?: Array<Contact>; newParentAddressBook?: Folder },
	{ contacts?: Array<Contact>; newParentAddressBook?: Folder }
>;

export const useActionMoveContacts = (): MoveContactsAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { createModal, closeModal } = useModal();

	const move = useCallback(
		(contactsIds: Array<string>, parentAddressBookId: string): Promise<boolean> =>
			apiClient
				.moveContact(contactsIds, parentAddressBookId)
				.then(() => {
					createSnackbar({
						key: `move-contact-success`,
						replace: true,
						severity: 'success',
						label: t('messages.snackbar.contact_moved', 'Contact moved'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					return true;
				})
				.catch(() => {
					createSnackbar({
						key: `move-contact-error`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					return false;
				}),
		[createSnackbar, t]
	);

	const canExecute = useCallback<MoveContactsAction['canExecute']>(
		({ contacts, newParentAddressBook } = {}): boolean => {
			if (!contacts || contacts.length === 0) {
				return false;
			}

			// Additional checks if the destination folder is given
			if (newParentAddressBook) {
				// Return false if all the given contacts already belong to the destination address book
				const parentsIds = contacts.map((contact) => contact.parent);

				if (!parentsIds.some((parentId) => parentId !== newParentAddressBook.id)) {
					return false;
				}

				if (!isWriteAllowed(newParentAddressBook)) {
					return false;
				}

				if (isRoot(newParentAddressBook.id)) {
					return false;
				}
			}

			const parentAddressBooks = contacts.reduce<Array<Folder>>((result, contact) => {
				const folder = getFolder(contact.parent);
				if (folder) {
					result.push(folder);
				}

				return result;
			}, []);

			return !every(parentAddressBooks, (addressBook) => isTrashed({ folder: addressBook }));
		},
		[]
	);

	const execute = useCallback<MoveContactsAction['execute']>(
		({ contacts, newParentAddressBook } = {}) => {
			if (!contacts || contacts.length === 0) {
				return;
			}

			if (!canExecute({ contacts, newParentAddressBook })) {
				return;
			}

			const contactsIds = contacts.map((contact) => contact.id);

			if (newParentAddressBook) {
				move(contactsIds, newParentAddressBook.id);
			} else {
				const modalId = 'move-contacts';
				createModal(
					{
						id: modalId,
						children: (
							<ContactMoveModal
								contacts={contacts}
								onMove={(parentAddressBookId): void => {
									move(contactsIds, parentAddressBookId).then(
										(success) => success && closeModal(modalId)
									);
								}}
								onClose={(): void => closeModal(modalId)}
							/>
						)
					},
					true
				);
			}
		},
		[canExecute, closeModal, createModal, move]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.moveContacts,
			label: t('label.move', 'Move'),
			icon: 'MoveOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
