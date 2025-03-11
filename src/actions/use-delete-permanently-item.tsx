/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, CreateModalArgs, useModal } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { Text } from '../components/Text';
import { ACTION_IDS } from '../constants';
import { Action } from './types';

type DeleteModal = { id: string; title: string; body: string };

type DeleteConfirmProps = {
	modal: DeleteModal;
	doDelete: () => Promise<void>;
};

type DeleteModalProps = DeleteModal & {
	deleteAction: () => Promise<void>;
};

const getDeleteModal = (
	{ id, title, body, deleteAction, onClose }: DeleteModalProps & { onClose: () => void },
	t: TFunction
): CreateModalArgs => [
	{
		id,
		title,
		confirmLabel: t('action.delete_permanently', 'Delete Permanently'),
		confirmColor: 'error',
		onConfirm: deleteAction,
		showCloseIcon: true,
		onClose,
		children: (
			<Container padding={{ vertical: 'medium' }} crossAlignment={'flex-start'}>
				<Text lineHeight={1.3125} overflow="break-word" size="small">
					{body}
				</Text>
			</Container>
		)
	}
];

function useCreateDeleteModalAction(): ({ modal, doDelete }: DeleteConfirmProps) => Action {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const handleDelete = (doDelete: () => Promise<void>, modalId: string): Promise<void> =>
		doDelete().then((response) => {
			closeModal(modalId);
			return response;
		});

	const createDeleteModal = (
		modalId: string,
		modalTitle: string,
		modalBody: string,
		doDelete: () => Promise<void>
	): void => {
		createModal(
			...getDeleteModal(
				{
					id: modalId,
					title: modalTitle,
					body: modalBody,
					deleteAction: () => handleDelete(doDelete, modalId),
					onClose: () => closeModal(modalId)
				},
				t
			)
		);
	};

	return ({ modal, doDelete }): Action => {
		const execute = (): void => {
			createDeleteModal(modal.id, modal.title, modal.body, doDelete);
		};

		return {
			id: ACTION_IDS.deletePermanently,
			label: t('action.deletePermanently', 'Delete Permanently'),
			icon: 'DeletePermanentlyOutline',
			onClick: execute,
			color: 'error'
		};
	};
}

type UseDeletePermanentlyItem = {
	modal: DeleteModal;
	onDeleteConfirm: () => void;
};
export const useDeletePermanentlyItem = ({
	modal,
	onDeleteConfirm
}: UseDeletePermanentlyItem): Action => {
	const createDeleteModal = useCreateDeleteModalAction();

	const doDelete = useCallback(async () => {
		onDeleteConfirm();
	}, [onDeleteConfirm]);
	return createDeleteModal({
		modal,
		doDelete
	});
};
