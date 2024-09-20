/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import {
	Container,
	CreateModalArgs,
	CreateSnackbarFn,
	useModal,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { closeBoard, getBoardById, useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { Text } from '../components/Text';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useGetContactGroupFromPath } from '../hooks/useGetContactGroupFromPath';
import { ContactGroup, SharedContactGroup } from '../model/contact-group';
import { apiClient } from '../network/api-client';
import { useContactGroupStore } from '../store/contact-groups';

type DeleteCGActionBase<T extends ContactGroup> = UIAction<T, never>;
export type DeleteCGAction = DeleteCGActionBase<ContactGroup>;
export type DeleteSharedCGAction = DeleteCGActionBase<SharedContactGroup>;

type DeleteModalProps = {
	modalId: string;
	modalTitle: string;
	deleteAction: () => Promise<string>;
};

type DeleteConfirmProps<T> = {
	modalId: string;
	doDelete: (contactGroup: T) => Promise<string>;
};

const getDeleteModal = (
	{ modalId, modalTitle, deleteAction, onClose }: DeleteModalProps & { onClose: () => void },
	t: TFunction,
	createSnackbar: CreateSnackbarFn
): CreateModalArgs => [
	{
		id: modalId,
		title: t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
			contactGroupName: modalTitle
		}),
		confirmLabel: t('modal.delete.button.confirm', 'delete'),
		confirmColor: 'error',
		onConfirm: () =>
			deleteAction()
				.then((contactGroupId: string) => {
					const boardId = `${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroupId}`;
					const board = getBoardById(boardId);
					if (board) {
						closeBoard(boardId);
					}
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
				}),
		showCloseIcon: true,
		onClose,
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
	}
];

function useCreateDeleteModalAction<T extends ContactGroup>(): ({
	modalId,
	doDelete
}: DeleteConfirmProps<T>) => DeleteCGActionBase<T> {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const { createModal, closeModal } = useModal();
	return ({ modalId, doDelete }): DeleteCGActionBase<T> => {
		const execute = (contactGroup?: T): void => {
			if (!contactGroup) return;
			createModal(
				...getDeleteModal(
					{
						modalId,
						modalTitle: contactGroup.title,
						deleteAction: () => doDelete(contactGroup),
						onClose: () => closeModal(modalId)
					},
					t,
					createSnackbar
				)
			);
		};
		return {
			id: ACTION_IDS.deleteCG,
			label: t('action.contactGroup.delete', 'Delete'),
			icon: 'Trash2Outline',
			canExecute: () => true,
			execute,
			color: 'error'
		};
	};
}

export const useActionDeleteMainAccountContactGroup = (): DeleteCGAction => {
	const replaceHistory = useReplaceHistoryCallback();
	const createDeleteModal = useCreateDeleteModalAction<ContactGroup>();
	const activeContactGroup = useGetContactGroupFromPath();
	const { removeContactGroup } = useContactGroupStore();
	const onDeleteConfirm = useCallback(
		async (contactGroup: ContactGroup) =>
			apiClient.deleteContact([contactGroup.id]).then(() => {
				if (activeContactGroup?.id === contactGroup.id) {
					replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/`);
				}
				removeContactGroup(contactGroup.id);
				return contactGroup.id;
			}),
		[activeContactGroup?.id, removeContactGroup, replaceHistory]
	);
	return createDeleteModal({
		modalId: 'delete-cg-modal',
		doDelete: onDeleteConfirm
	});
};

export const useActionDeleteSharedAccountContactGroup = (): DeleteSharedCGAction => {
	const createDeleteModal = useCreateDeleteModalAction<SharedContactGroup>();
	const replaceHistory = useReplaceHistoryCallback();
	const activeContactGroup = useGetContactGroupFromPath();
	const { removeSharedContactGroup } = useContactGroupStore();
	const onDeleteConfirm = useCallback(
		async (contactGroup: SharedContactGroup) =>
			apiClient.deleteContact([contactGroup.id]).then(() => {
				if (activeContactGroup?.id === contactGroup.id) {
					replaceHistory(
						`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${contactGroup.accountId}/`
					);
				}
				removeSharedContactGroup(contactGroup.accountId, contactGroup.id);
				return contactGroup.id;
			}),
		[activeContactGroup?.id, removeSharedContactGroup, replaceHistory]
	);

	return createDeleteModal({
		modalId: 'delete-shared-cg-modal',
		doDelete: (contactGroup: SharedContactGroup) => onDeleteConfirm(contactGroup)
	});
};
