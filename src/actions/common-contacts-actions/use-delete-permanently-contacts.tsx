/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { every } from 'lodash';
import { useTranslation } from 'react-i18next';

import { isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../carbonio-ui-commons/types';
import { TIMEOUTS } from '../../constants';
import { ContactOrGroup } from '../../legacy/types/contact';
import { apiClient } from '../../network/api-client';
import { useDeletePermanentlyItem } from '../delete-permanently-item';
import { UIAction } from '../types';

export const useDeletePermanentlyContacts = (
	contacts: Array<ContactOrGroup>
): UIAction<void, void> => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback((): boolean => {
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
	}, [contacts]);

	const onDeleteConfirm = useCallback(() => {
		const contactsIds = contacts.map((cont) => cont.id);
		apiClient
			.deleteContact(contactsIds)
			.then(() => {
				createSnackbar({
					key: `delete-contacts-success`,
					replace: true,
					severity: 'info',
					label: t('messages.snackbar.contact_deleted_permanently', 'Contact permanently deleted'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
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
	}, [contacts, createSnackbar, t]);
	const modalTitle = useMemo(
		() =>
			t('messages.modal.delete.sure_delete_contact', {
				count: contacts.length,
				defaultValue_one: 'Are you sure to permanently delete this contact?',
				defaultValue_other: 'Are you sure to permanently delete the selected contacts?'
			}),
		[contacts.length, t]
	);

	const confirmationText = useMemo(
		() =>
			t(
				'messages.modal.delete.if_delete_lost_forever',
				'By permanently deleting this contact you will not be able to recover it anymore, continue?'
			),
		[t]
	);

	const deletePermanentlyItem = useDeletePermanentlyItem({
		modal: { id: 'delete-cg-modal', title: modalTitle, body: confirmationText },
		onDeleteConfirm
	});
	return { ...deletePermanentlyItem, canExecute };
};
