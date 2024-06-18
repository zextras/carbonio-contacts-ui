/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isRoot, isWriteAllowed } from '../carbonio-ui-commons/helpers/folders';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

export type MoveContactAction = UIAction<
	{ contacts?: Array<Contact>; newParentAddressBook?: Folder },
	{ contacts?: Array<Contact>; newParentAddressBook?: Folder }
>;

export const useActionMoveContact = (): MoveContactAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const move = useCallback(
		(contactsIds: Array<string>, parentAddressBookId: string): void => {
			apiClient
				.moveContact(contactsIds, parentAddressBookId)
				.then(() => {
					createSnackbar({
						key: `move-contact-success`,
						replace: true,
						type: 'success',
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
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					return false;
				});
		},
		[createSnackbar, t]
	);

	const canExecute = useCallback<MoveContactAction['canExecute']>(
		({ contacts, newParentAddressBook } = {}): boolean => {
			if (!contacts || contacts.length === 0 || newParentAddressBook === undefined) {
				return false;
			}

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

			return true;
		},
		[]
	);

	const execute = useCallback<MoveContactAction['execute']>(
		({ contacts, newParentAddressBook } = {}) => {
			if (!contacts || contacts.length === 0 || newParentAddressBook === undefined) {
				return;
			}

			if (!canExecute({ contacts, newParentAddressBook })) {
				return;
			}

			const contactsIds = contacts.map((contact) => contact.id);

			if (newParentAddressBook) {
				move(contactsIds, newParentAddressBook.id);
			}
			// else {
			// 	const closeModal = createModal(
			// 		{
			// 			children: (
			// 				<AddressBookMoveModal
			// 					addressBookId={addressBook.id}
			// 					onMove={(parentAddressBookId) => {
			// 						move(addressBook.id, parentAddressBookId).then(
			// 							(success) => success && closeModal()
			// 						);
			// 					}}
			// 					onClose={() => closeModal()}
			// 				/>
			// 			)
			// 		},
			// 		true
			// 	);
			// }
		},
		[canExecute, move]
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
