/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	type Action,
	Container,
	useModal,
	useSnackbar,
	Text
} from '@zextras/carbonio-design-system';
import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

import { GROUPS_ROUTE } from '../constants';

function getSnackbarTitle(title: string): string {
	return title.length > 50 ? title.substring(0, 50).concat('...') : title;
}

export const useActions = (contact: { id: string; title: string }): Action[] => {
	const { id, title } = contact;
	const [t] = useTranslation();
	const createModal = useModal();

	const createSnackbar = useSnackbar();
	const trashAction = noop;

	const openDeleteModal = useCallback(() => {
		const closeModal = createModal({
			title: t('modal.delete.header', 'This action is irreversible'),
			size: 'medium',
			confirmLabel: t('modal.delete.button.confirm', 'Delete permanently'),
			confirmColor: 'error',
			onConfirm: () => {
				// trashAction().then(() => {
				// 	closeModal();
				// 	createSnackbar({
				// 		type: 'success',
				// 		key: `snackbar-${Date.now()}`,
				// 		label: t('snackbar.permanentlyDeletedTask', 'Task permanently deleted'),
				// 		hideButton: true
				// 	});
				// });
			},
			showCloseIcon: true,
			onClose: () => {
				closeModal();
			},
			children: (
				<Container padding={{ vertical: 'large' }}>
					<Text overflow="break-word" size="medium">
						{t(
							'modal.delete.body',
							'You will delete permanently this task. You will not be able to recover this tasks anymore. This action is irreversible.'
						)}
					</Text>
				</Container>
			)
		});
	}, [createModal, t]);

	const editAction = useCallback<Action['onClick']>(() => {
		const board = getBoardById(`edit-contactGroup-${contact.id}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `edit-contactGroup-${contact.id}`,
				url: `${GROUPS_ROUTE}/edit`,
				title: 'Edit Contact group',
				context: { contactGroupId: contact.id }
			});
		}
	}, [contact.id]);

	return useMemo<Action[]>((): Action[] => {
		const orderedActions: Action[] = [
			{
				id: 'edit',
				label: t('action.edit', 'Edit'),
				icon: 'Edit2Outline',
				onClick: editAction
			},
			{
				id: 'delete',
				label: t('action.delete', 'Delete'),
				icon: 'Trash2Outline',
				onClick: openDeleteModal,
				color: 'error'
			}
		];
		return orderedActions;
	}, [editAction, openDeleteModal, t]);
};
