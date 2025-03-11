/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { closeBoard, getBoardById } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { useDeletePermanentlyItem } from '../../../actions/delete-permanently-item';
import { UIAction } from '../../../actions/types';
import { EDIT_CONTACT_GROUP_BOARD_ID } from '../../../constants';
import { useGetContactGroupFromPath } from '../../../hooks/useGetContactGroupFromPath';
import { ContactGroup } from '../../../model/contact-group';
import { apiClient } from '../../../network/api-client';
import { useRedirectToContactGroupFolder } from '../navigation';

type DeleteContactGroupActionReturn = {
	contactGroupId: string;
};

// TODO: consider not using UIAction because "canExecute" does not make much sense
export const useActionDeleteContactGroup = (contactGroup: ContactGroup): UIAction<void, void> => {
	const [t] = useTranslation();
	const modalTitle = t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
		contactGroupName: contactGroup.title
	});
	const modalBody = t(
		'modal.delete.contactGroup.body1',
		'Are you sure to delete the selected contact group?'
	);
	const activeContactGroup = useGetContactGroupFromPath();
	const createSnackbar = useSnackbar();
	const redirectTo = useRedirectToContactGroupFolder();

	const onDeleteConfirm = useCallback(
		async () =>
			apiClient
				.deleteContact([contactGroup.id])
				.then(() => {
					if (activeContactGroup?.id === contactGroup.id) {
						contactGroup && redirectTo(contactGroup);
					}
					return { contactGroupId: contactGroup.id };
				})
				.then((response: DeleteContactGroupActionReturn) => {
					const boardId = `${EDIT_CONTACT_GROUP_BOARD_ID}-${response.contactGroupId}`;
					const board = getBoardById(boardId);
					if (board) {
						closeBoard(boardId);
					}
					createSnackbar({
						severity: 'success',
						key: `snackbar-${Date.now()}`,
						label: t(
							'snackbar.delete_contact_group.confirm.success',
							'Contact group successfully deleted'
						),
						hideButton: true
					});
				})
				.catch(() => {
					createSnackbar({
						key: `snackbar-${Date.now()}`,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						hideButton: true
					});
				}),
		[activeContactGroup?.id, contactGroup, createSnackbar, redirectTo, t]
	);

	const deletePermanentlyItem = useDeletePermanentlyItem({
		modal: { id: 'delete-cg-modal', title: modalTitle, body: modalBody },
		onDeleteConfirm
	});
	return { ...deletePermanentlyItem, canExecute: () => true };
};
