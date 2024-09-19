/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { closeBoard, getBoardById, useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { UIAction } from './types';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { Text } from '../components/Text';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';
import { ContactGroup } from '../model/contact-group';
import { apiClient } from '../network/api-client';
import { useContactGroupStore } from '../store/contact-groups';

export type DeleteCGAction = UIAction<ContactGroup, never>;

export const useActionDeleteCG = (): DeleteCGAction => {
	const { id } = useParams<{ id: string }>();
	const { zid: accountId } = getFolderIdParts(id);
	const redirectPath = `${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId ?? FOLDERS.CONTACTS}/`;
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();
	const { removeContactGroup } = useContactGroupStore();
	const activeContactGroup = useActiveContactGroup();

	const canExecute = useCallback<DeleteCGAction['canExecute']>(() => true, []);

	const openDeleteModal = useCallback<DeleteCGAction['execute']>(
		(contactGroup) => {
			if (contactGroup === undefined) {
				return;
			}

			const modalId = 'delete-cg';
			createModal({
				id: modalId,
				title: t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
					contactGroupName: contactGroup.title
				}),
				confirmLabel: t('modal.delete.button.confirm', 'delete'),
				confirmColor: 'error',
				onConfirm: () => {
					closeModal(modalId);
					apiClient
						.deleteContact([contactGroup.id])
						.then(() => {
							const boardId = `${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroup.id}`;
							const board = getBoardById(boardId);
							if (board) {
								closeBoard(boardId);
							}
							if (activeContactGroup?.id === contactGroup.id) {
								replaceHistory(redirectPath);
							}
							removeContactGroup(contactGroup.id);
							createSnackbar({
								type: 'success',
								key: `snackbar-${Date.now()}`,
								label: t(
									'snackbar.delete_contact_group.confirm.success',
									'Contact group successfully deleted'
								),
								hideButton: true
							});
						})
						.catch((error: Error) => {
							createSnackbar({
								key: `snackbar-${Date.now()}`,
								type: 'error',
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								hideButton: true
							});
							console.error(error);
						});
				},
				showCloseIcon: true,
				onClose: () => {
					closeModal(modalId);
				},
				children: (
					<Container padding={{ vertical: 'medium' }} crossAlignment={'flex-start'}>
						<Text lineHeight={1.3125} overflow="break-word" size="small">
							{t(
								'modal.delete.contactGroup.body1',
								'Are you sure to delete the selected contact group?'
							)}
						</Text>
						<Text lineHeight={1.3125} overflow="break-word" size="small">
							{t('modal.delete.contactGroup.body2', 'If you delete it will be lost forever.')}
						</Text>
					</Container>
				)
			});
		},
		[
			activeContactGroup?.id,
			closeModal,
			createModal,
			createSnackbar,
			redirectPath,
			removeContactGroup,
			replaceHistory,
			t
		]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.deleteCG,
			label: t('action.contactGroup.delete', 'Delete'),
			icon: 'Trash2Outline',
			canExecute,
			execute: openDeleteModal,
			color: 'error'
		}),
		[openDeleteModal, canExecute, t]
	);
};
