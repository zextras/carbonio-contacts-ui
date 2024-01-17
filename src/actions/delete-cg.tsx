/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, useModal, useSnackbar, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS } from '../constants';
import { ContactGroup } from '../model/contact-group';
import { client } from '../network/client';
import { useContactGroupStore } from '../store/contact-groups';

export type DeleteCGAction = UIAction<ContactGroup, never>;

export const useActionDeleteCG = (): DeleteCGAction => {
	const [t] = useTranslation();
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	const { removeStoredContactGroup } = useContactGroupStore();

	const canExecute = useCallback<DeleteCGAction['canExecute']>(() => true, []);

	const openDeleteModal = useCallback<DeleteCGAction['execute']>(
		(contactGroup) => {
			if (contactGroup === undefined) {
				return;
			}

			const closeModal = createModal({
				title: t('modal.delete.contactGroup.header', 'Delete "{{contactGroupName}}"', {
					contactGroupName: contactGroup.title
				}),
				confirmLabel: t('modal.delete.button.confirm', 'delete'),
				confirmColor: 'error',
				onConfirm: () => {
					closeModal();
					client.deleteContactAction([contactGroup.id]).then((result) => {
						removeStoredContactGroup(contactGroup.id);
						createSnackbar({
							type: 'success',
							key: `snackbar-${Date.now()}`,
							label: t(
								'snackbar.delete_contact_group.confirm.success',
								'Contact group successfully deleted'
							),
							hideButton: true
						});
					});
				},
				showCloseIcon: true,
				onClose: () => {
					closeModal();
				},
				children: (
					<Container padding={{ vertical: 'large' }} crossAlignment={'flex-start'}>
						<Text overflow="break-word" size="medium">
							{t(
								'modal.delete.contactGroup.body1',
								'Are you sure to delete the selected contact group?'
							)}
						</Text>
						<Text overflow="break-word" size="medium">
							{t('modal.delete.contactGroup.body2', 'If you delete it will be lost forever.')}
						</Text>
					</Container>
				)
			});
		},
		[createModal, createSnackbar, removeStoredContactGroup, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.deleteCG,
			label: t('action.contactGroup.delete', 'Delete'),
			icon: 'Trash2Outline',
			canExecute,
			execute: openDeleteModal
		}),
		[openDeleteModal, canExecute, t]
	);
};
