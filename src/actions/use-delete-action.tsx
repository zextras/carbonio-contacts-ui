/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Text } from '../components/Text';
import { ACTION_IDS } from '../constants';
import { Action } from './types';

type DeleteModal = { id: string; title: string; body: string };

type UseDeleteActionProps = {
	modal: DeleteModal;
	onDeleteConfirm: () => Promise<void>;
};

function useCreateDeleteModalAction(): ({
	modal,
	onDeleteConfirm
}: UseDeleteActionProps) => Action {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	return ({ modal, onDeleteConfirm }): Action => {
		const onClose = (): void => closeModal(modal.id);
		const onConfirm = (): void => {
			onDeleteConfirm().then(() => {
				onClose();
			});
		};
		const execute = (): void => {
			createModal({
				id: modal.id,
				title: modal.title,
				confirmLabel: t('action.delete_permanently', 'Delete Permanently'),
				confirmColor: 'error',
				onConfirm,
				showCloseIcon: true,
				onClose,
				children: (
					<Container padding={{ vertical: 'medium' }} crossAlignment={'flex-start'}>
						<Text lineHeight={1.3125} overflow="break-word" size="small">
							{modal.body}
						</Text>
					</Container>
				)
			});
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

export const useDeleteAction = ({ modal, onDeleteConfirm }: UseDeleteActionProps): Action => {
	const createDeleteModal = useCreateDeleteModalAction();
	return createDeleteModal({
		modal,
		onDeleteConfirm
	});
};
