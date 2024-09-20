/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Container, CreateModalArgs, useModal } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { Text } from '../components/Text';
import { ACTION_IDS, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useGetContactGroupFromPath } from '../hooks/useGetContactGroupFromPath';
import { ContactGroup, SharedContactGroup } from '../model/contact-group';
import { apiClient } from '../network/api-client';
import { useContactGroupStore } from '../store/contact-groups';

export type DeleteCGAction = UIAction<ContactGroup, never>;
export type DeleteSharedCGAction = UIAction<SharedContactGroup, never>;

type DeleteModalFactoryProps = {
	modalId: string;
	modalTitle: string;
	onConfirm: () => void;
	onClose: () => void;
};

export const useCreateDeleteModal = (): ((props: DeleteModalFactoryProps) => CreateModalArgs) => {
	const [t] = useTranslation();
	return ({
		modalId,
		modalTitle,
		onConfirm,
		onClose
	}: DeleteModalFactoryProps): CreateModalArgs => [
		{
			id: modalId,
			title: t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
				contactGroupName: modalTitle
			}),
			confirmLabel: t('modal.delete.button.confirm', 'delete'),
			confirmColor: 'error',
			onConfirm,
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
};

export const useActionDeleteMainAccountContactGroup = (): DeleteCGAction => {
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const { createModal, closeModal } = useModal();
	const deleteModalArgsFactory = useCreateDeleteModal();
	const activeContactGroup = useGetContactGroupFromPath();
	const { removeContactGroup } = useContactGroupStore();
	const onDeleteConfirm = useCallback(
		async (contactGroup: ContactGroup) => {
			apiClient.deleteContact([contactGroup.id]).then(() => {
				if (activeContactGroup?.id === contactGroup.id) {
					replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/`);
				}
				removeContactGroup(contactGroup.id);
			});
		},
		[activeContactGroup?.id, removeContactGroup, replaceHistory]
	);

	const executeDeleteMainAccountContactGroup = useCallback<DeleteCGAction['execute']>(
		(contactGroup) => {
			if (contactGroup === undefined) {
				return;
			}
			const modalId = 'delete-shared-cg-modal';
			const modalArgs = deleteModalArgsFactory({
				modalId,
				modalTitle: contactGroup.title,
				onClose: () => closeModal(modalId),
				onConfirm: () => onDeleteConfirm
			});
			createModal(...modalArgs);
		},
		[closeModal, createModal, deleteModalArgsFactory, onDeleteConfirm]
	);

	return {
		id: ACTION_IDS.deleteCG,
		label: t('action.contactGroup.delete', 'Delete'),
		icon: 'Trash2Outline',
		canExecute: () => true,
		execute: executeDeleteMainAccountContactGroup,
		color: 'error'
	};
};

export const useActionDeleteSharedAccountContactGroup = (): DeleteSharedCGAction => {
	const [t] = useTranslation();
	const replaceHistory = useReplaceHistoryCallback();
	const { createModal, closeModal } = useModal();
	const deleteModalArgsFactory = useCreateDeleteModal();
	const activeContactGroup = useGetContactGroupFromPath();
	const { removeSharedContactGroup } = useContactGroupStore();
	const onDeleteConfirm = useCallback(
		async (contactGroup: SharedContactGroup) => {
			apiClient.deleteContact([contactGroup.id]).then(() => {
				if (activeContactGroup?.id === contactGroup.id) {
					replaceHistory(
						`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${contactGroup.accountId}/`
					);
				}
				removeSharedContactGroup(contactGroup.accountId, contactGroup.id);
			});
		},
		[activeContactGroup?.id, removeSharedContactGroup, replaceHistory]
	);

	const executeDeleteSharedAccountContactGroup = useCallback<DeleteSharedCGAction['execute']>(
		(contactGroup) => {
			if (contactGroup === undefined) {
				return;
			}
			const modalId = 'delete-shared-cg-modal';
			const modalArgs = deleteModalArgsFactory({
				modalId,
				modalTitle: contactGroup.title,
				onClose: () => closeModal(modalId),
				onConfirm: () => onDeleteConfirm
			});
			createModal(...modalArgs);
		},
		[closeModal, createModal, deleteModalArgsFactory, onDeleteConfirm]
	);

	return {
		id: ACTION_IDS.deleteCG,
		label: t('action.contactGroup.delete', 'Delete'),
		icon: 'Trash2Outline',
		canExecute: () => true,
		execute: executeDeleteSharedAccountContactGroup,
		color: 'error'
	};
};
