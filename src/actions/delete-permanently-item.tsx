/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, CreateModalArgs, useModal } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ACTION_IDS } from '../constants';
import { DeletableItem, UIAction } from './types';
import { Text } from '../components/Text';
import { CONTACT_GROUP_DELETE_ICON } from '../views/contact-groups/actions/constants';

type DeleteItemActionReturn = {
	deletedItemId: string;
};
type DeleteConfirmProps<T extends DeletableItem> = {
	modal: { modalId: string; title: string };
	doDelete: (item: T) => Promise<DeleteItemActionReturn>;
};
type DeleteActionBase<T extends DeletableItem> = UIAction<T, T>;
type DeleteModalProps = {
	modalId: string;
	modalTitle: string;
	deleteAction: () => Promise<DeleteItemActionReturn>;
};

const getDeleteModal = (
	{ modalId, modalTitle, deleteAction, onClose }: DeleteModalProps & { onClose: () => void },
	t: TFunction
): CreateModalArgs => [
	{
		id: modalId,
		title: t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
			contactGroupName: modalTitle
		}),
		confirmLabel: t('modal.delete.button.confirm', 'delete'),
		confirmColor: 'error',
		onConfirm: deleteAction,
		showCloseIcon: true,
		onClose,
		children: (
			<Container padding={{ vertical: 'medium' }} crossAlignment={'flex-start'}>
				<Text lineHeight={1.3125} overflow="break-word" size="small">
					{modalTitle}
				</Text>
			</Container>
		)
	}
];

function useCreateDeleteModalAction<T extends DeletableItem>(): ({
	modal,
	doDelete
}: DeleteConfirmProps<T>) => DeleteActionBase<T> {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const handleDelete = (
		item: T,
		doDelete: (item: T) => Promise<DeleteItemActionReturn>,
		modalId: string
	): Promise<DeleteItemActionReturn> =>
		doDelete(item).then((response) => {
			closeModal(modalId);
			return response;
		});

	const createDeleteModal = (
		modalId: string,
		modalTitle: string,
		contactGroup: T,
		doDelete: (contactGroup: T) => Promise<DeleteItemActionReturn>
	): void => {
		createModal(
			...getDeleteModal(
				{
					modalId,
					modalTitle,
					deleteAction: () => handleDelete(contactGroup, doDelete, modalId),
					onClose: () => closeModal(modalId)
				},
				t
			)
		);
	};

	return ({ modal, doDelete }): DeleteActionBase<T> => {
		const execute = (item?: T): void => {
			if (!item) return;
			createDeleteModal(modal.modalId, modal.title, item, doDelete);
		};

		return {
			id: ACTION_IDS.deletePermanently,
			label: t('action.deletePermanently', 'Delete Permanently'),
			icon: CONTACT_GROUP_DELETE_ICON,
			canExecute: () => true,
			execute,
			color: 'error'
		};
	};
}

type DeletePermanentlyItem<T extends DeletableItem> = {
	modal: { modalId: string; title: string };
	onDeleteConfirm: (item: T) => void;
};
export const useDeletePermanentlyItem = <T extends DeletableItem>({
	modal,
	onDeleteConfirm
}: DeletePermanentlyItem<T>): UIAction<T, T> => {
	const createDeleteModal = useCreateDeleteModalAction<T>();

	// NOTE: there is no store because this request is intercepted and item is ***magically*** removed
	const doDelete = useCallback(
		async (item: T) => {
			onDeleteConfirm(item);
			return { deletedItemId: item.id };
		},
		[onDeleteConfirm]
	);
	return createDeleteModal({
		modal,
		doDelete
	});
};
