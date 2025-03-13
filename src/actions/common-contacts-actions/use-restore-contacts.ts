/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../carbonio-ui-commons/types';
import { TIMEOUTS } from '../../constants';
import { RESTORE_ACTION } from '../../constants/actions';
import { ContactOrGroup } from '../../legacy/types/contact';
import { apiClient } from '../../network/api-client';
import { Action } from '../types';
import { useSelectFolderAction } from '../use-select-folder-action';

export const useRestoreContacts = (contacts: Array<ContactOrGroup>, modalTitle: string): Action => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const contactIds = contacts.map((contact) => contact.id);
	const move = useCallback(
		(selectedFolder: Folder, onCloseModal: () => void): Promise<void> =>
			apiClient
				.moveContact(contactIds, selectedFolder.id)
				.then(() => {
					createSnackbar({
						key: `move-contact-success`,
						replace: true,
						severity: 'success',
						label: t('messages.snackbar.contact_restored', 'Contact restored'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
					onCloseModal();
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
				}),
		[contactIds, createSnackbar, t]
	);
	const restoreModal = {
		id: `${RESTORE_ACTION.ID}-modal`,
		confirmButtonLabel: t('label.restore', 'Restore'),
		title: modalTitle
	};

	return useSelectFolderAction({
		actionId: RESTORE_ACTION.ID,
		label: t('label.restore', 'Restore'),
		modal: restoreModal,
		icon: RESTORE_ACTION.ICON,
		onConfirm: move
	});
};
