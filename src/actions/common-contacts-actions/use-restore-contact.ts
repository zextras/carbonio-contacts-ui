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
import { useMoveItemAction } from '../move-items';
import { UIAction } from '../types';

export const useRestoreContact = (
	contact: ContactOrGroup,
	modalTitle: string
): UIAction<void, void> => {
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
						label: t('messages.snackbar.contact_restored', 'Contact restored'),
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
	const restoreModal = {
		id: ACTION_IDS.restoreContacts,
		confirmButtonLabel: t('label.restore', 'Restore'),
		title: modalTitle
	};
	const contactGroupIds = [contact.id];
	const action = useMoveItemAction({
		actionId: ACTION_IDS.restoreContacts,
		label: t('label.restore', 'Restore'),
		modal: restoreModal,
		icon: 'RestoreOutline',
		onMoveConfirm: (targetFolder: Folder) => move(contactGroupIds, targetFolder.id)
	});
	return { ...action, canExecute: () => true };
};
