/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { every } from 'lodash';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isTrashed } from '../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

export type ActionTrashContact = UIAction<Array<Contact>, Array<Contact>>;
export const useActionTrashContact = (): ActionTrashContact => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback<ActionTrashContact['canExecute']>((contacts): boolean => {
		if (!contacts || contacts.length === 0) return false;
		const parentContacts = contacts.reduce<Array<Folder>>((result, contact) => {
			const folder = getFolder(contact.parent);
			if (folder) {
				result.push(folder);
			}

			return result;
		}, []);
		if (parentContacts.length === 0) return false;
		return every(parentContacts, (cont) => !isTrashed({ folder: cont }));
	}, []);

	const onRestore = useCallback(
		(contacts: Array<Contact>) => {
			// TODO support contacts in different parents
			const firstParent = contacts[0].parent;
			const contactsIds = contacts.map((cont) => cont.id);
			apiClient
				.moveContact(contactsIds, firstParent)
				.then(() => {
					createSnackbar({
						key: `restore-contacts-success`,
						replace: true,
						type: 'success',
						label: t('messages.snackbar.contact_restored', 'Contact restored'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				})
				.catch(() => {
					createSnackbar({
						key: `restore-contacts-error`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				});
		},
		[createSnackbar, t]
	);

	const execute = useCallback<ActionTrashContact['execute']>(
		(contacts) => {
			if (!contacts) return;
			if (!canExecute(contacts)) return;
			const contactsIds = contacts.map((cont) => cont.id);
			apiClient
				.trashContacts(contactsIds)
				.then(() => {
					createSnackbar({
						key: `delete-contacts-success`,
						replace: true,
						type: 'info',
						label: t('messages.snackbar.contact_moved_to_trash', 'Contact moved to trash'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: false,
						actionLabel: t('label.undo', 'Undo'),
						onActionClick: () => onRestore(contacts)
					});
				})
				.catch(() =>
					createSnackbar({
						key: `delete-contacts-error`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					})
				);
		},
		[createSnackbar, canExecute, onRestore, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.trashContacts,
			label: t('folder.action.delete_permanently', 'Delete contacts permanently'),
			icon: 'Trash2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
