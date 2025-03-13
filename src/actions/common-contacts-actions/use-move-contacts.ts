/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../carbonio-ui-commons/types';
import { ACTION_IDS, TIMEOUTS } from '../../constants';
import { ContactOrGroup } from '../../legacy/types/contact';
import { apiClient } from '../../network/api-client';
import { Action } from '../types';
import { useSelectFolderAction } from '../use-select-folder-action';

export const useMoveContacts = (contacts: Array<ContactOrGroup>, modalTitle: string): Action => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const move = useCallback(
		(contactsIds: Array<string>, parentAddressBookId: string): Promise<void> =>
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
		[createSnackbar, t]
	);
	const moveModal = {
		id: 'move-contacts-modal',
		confirmButtonLabel: t('label.move', 'Move'),
		title: modalTitle
	};
	const contactGroupIds = contacts.map((contact) => contact.id);
	return useSelectFolderAction({
		actionId: ACTION_IDS.move,
		label: t('label.move', 'Move'),
		modal: moveModal,
		icon: 'MoveOutline',
		onConfirm: (targetFolder: Folder) => move(contactGroupIds, targetFolder.id)
	});
};
