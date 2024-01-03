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

export const useActions = (contactGroup: { id: string; title: string }): Action[] => {
	const { id, title } = contactGroup;
	const [t] = useTranslation();
	const createModal = useModal();

	const createSnackbar = useSnackbar();
	const trashAction = noop;

	const openDeleteModal = useCallback(() => {
		const closeModal = createModal({
			title: t('folder.action.deleteContactGroup', 'Delete "{{contactGroupTitle}}"', {
				replace: {
					contactGroupTitle: `${
						contactGroup.title.length > 50
							? contactGroup.title.substring(0, 50).concat('...')
							: contactGroup.title
					}`
				}
			}),
			size: 'medium',
			confirmLabel: t('action.delete', 'Delete'),
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
				<Container padding={{ vertical: 'large' }} crossAlignment={'flex-start'}>
					<Text overflow="break-word" size="medium">
						Are you sure to delete the selected contact group?
					</Text>
					<Text overflow="break-word" size="medium">
						If you delete it will be lost forever.
					</Text>
				</Container>
			)
		});
	}, [contactGroup.title, createModal, t]);

	const editAction = useCallback<Action['onClick']>(() => {
		const board = getBoardById(`edit-contactGroup-${contactGroup.id}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `edit-contactGroup-${contactGroup.id}`,
				url: `${GROUPS_ROUTE}/edit`,
				title: 'Edit Contact group',
				context: { contactGroupId: contactGroup.id }
			});
		}
	}, [contactGroup.id]);

	return useMemo<Action[]>((): Action[] => {
		const orderedActions: Action[] = [
			{
				id: 'mail',
				label: t('action.mail', 'Mail'),
				icon: 'EmailOutline',
				onClick: noop
			},
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
