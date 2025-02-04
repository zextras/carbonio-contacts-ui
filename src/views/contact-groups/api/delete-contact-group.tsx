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
import { closeBoard, getBoardById } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { UIAction } from '../../../actions/types';
import { Text } from '../../../components/Text';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID } from '../../../constants';
import { useGetContactGroupFromPath } from '../../../hooks/useGetContactGroupFromPath';
import { ContactGroup } from '../../../model/contact-group';
import { apiClient } from '../../../network/api-client';
import { useRedirectToContactGroupFolder } from '../navigation';

type DeleteCGActionBase<T extends ContactGroup> = UIAction<T, T>;
export type DeleteCGAction = DeleteCGActionBase<ContactGroup>;

type DeleteContactGroupActionReturn = {
	contactGroupId: string;
};

type DeleteModalProps = {
	modalId: string;
	modalTitle: string;
	deleteAction: () => Promise<DeleteContactGroupActionReturn>;
};

type DeleteConfirmProps<T> = {
	modalId: string;
	doDelete: (contactGroup: T) => Promise<DeleteContactGroupActionReturn>;
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
		onConfirm: (): void => {
			deleteAction()
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
				});
		},
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

	const handleDelete = (
		contactGroup: T,
		doDelete: (contactGroup: T) => Promise<DeleteContactGroupActionReturn>,
		modalId: string
	): Promise<DeleteContactGroupActionReturn> =>
		doDelete(contactGroup).then((response) => {
			closeModal(modalId);
			return response;
		});

	const createDeleteModal = (
		modalId: string,
		contactGroup: T,
		doDelete: (contactGroup: T) => Promise<DeleteContactGroupActionReturn>
	): void => {
		createModal(
			...getDeleteModal(
				{
					modalId,
					modalTitle: contactGroup.title,
					deleteAction: () => handleDelete(contactGroup, doDelete, modalId),
					onClose: () => closeModal(modalId)
				},
				t,
				createSnackbar
			)
		);
	};

	return ({ modalId, doDelete }): DeleteCGActionBase<T> => {
		const execute = (contactGroup?: T): void => {
			if (!contactGroup) return;
			createDeleteModal(modalId, contactGroup, doDelete);
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

export const useActionDeleteContactGroup = (): DeleteCGAction => {
	const createDeleteModal = useCreateDeleteModalAction<ContactGroup>();
	const activeContactGroup = useGetContactGroupFromPath();

	const redirectTo = useRedirectToContactGroupFolder();

	// NOTE: there is no store because this request is intercepted and item is ***magically*** removed
	const onDeleteConfirm = useCallback(
		async (contactGroup: ContactGroup) =>
			apiClient.deleteContact([contactGroup.id]).then(() => {
				if (activeContactGroup?.id === contactGroup.id) {
					contactGroup && redirectTo(contactGroup);
				}
				return { contactGroupId: contactGroup.id };
			}),
		[activeContactGroup?.id, redirectTo]
	);
	return createDeleteModal({
		modalId: 'delete-cg-modal',
		doDelete: onDeleteConfirm
	});
};
