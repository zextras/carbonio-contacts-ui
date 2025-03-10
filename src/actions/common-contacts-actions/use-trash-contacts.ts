/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { every } from 'lodash';
import { useTranslation } from 'react-i18next';

import { isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { Folder } from '../../carbonio-ui-commons/types';
import { ACTION_IDS, TIMEOUTS } from '../../constants';
import { ContactOrGroup } from '../../legacy/types/contact';
import { apiClient } from '../../network/api-client';
import { getParentFolder } from '../folder-utils';
import { UIAction } from '../types';

export type ActionTrashContacts = UIAction<void, void>;

export const useTrashContacts = (contacts: Array<ContactOrGroup>): ActionTrashContacts => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback<ActionTrashContacts['canExecute']>((): boolean => {
		if (!contacts || contacts.length === 0) return false;
		const parentContacts = contacts.reduce<Array<Folder>>((result, contact) => {
			const folder = getParentFolder(contact);
			if (folder) {
				result.push(folder);
			}

			return result;
		}, []);
		if (parentContacts.length === 0) return false;
		return every(parentContacts, (cont: Folder) => !isTrashed({ folder: cont }));
	}, [contacts]);

	const onRestore = useCallback(() => {
		// TODO support contacts in different parents
		const firstParent = contacts[0].parent;
		const contactsIds = contacts.map((cont) => cont.id);
		apiClient
			.moveContact(contactsIds, firstParent)
			.then(() => {
				createSnackbar({
					key: `restore-contacts-success`,
					replace: true,
					severity: 'success',
					label: t('messages.snackbar.contact_restored', 'Contact restored'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
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
			});
	}, [contacts, createSnackbar, t]);

	const execute = useCallback<ActionTrashContacts['execute']>(() => {
		if (!contacts) return;
		if (!canExecute()) return;
		const contactsIds = contacts.map((cont) => cont.id);
		apiClient
			.trashContacts(contactsIds)
			.then(() => {
				createSnackbar({
					key: `delete-contacts-success`,
					replace: true,
					severity: 'info',
					label: t('messages.snackbar.contact_moved_to_trash', 'Contact moved to trash'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: false,
					actionLabel: t('label.undo', 'Undo'),
					onActionClick: () => onRestore()
				});
			})
			.catch(() =>
				createSnackbar({
					key: `delete-contacts-error`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				})
			);
	}, [contacts, canExecute, createSnackbar, t, onRestore]);

	return useMemo(
		() => ({
			id: ACTION_IDS.trashContacts,
			label: t('label.delete', 'Delete'),
			icon: 'Trash2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
