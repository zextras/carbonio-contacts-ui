/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, useModal, useSnackbar, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS, ROUTES_INTERNAL_PARAMS } from '../constants';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';
import { useNavigation } from '../hooks/useNavigation';
import { ContactGroup } from '../model/contact-group';
import { client } from '../network/client';
import { useContactGroupStore } from '../store/contact-groups';

export type DeleteCGAction = UIAction<ContactGroup, never>;

export const useActionDeleteCG = (): DeleteCGAction => {
	const [t] = useTranslation();
	const createModal = useModal();
	const createSnackbar = useSnackbar();
	const { removeStoredContactGroup } = useContactGroupStore();
	const { navigateTo } = useNavigation();
	const activeContactGroup = useActiveContactGroup();

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
					client
						.deleteContactAction([contactGroup.id])
						.then(() => {
							if (activeContactGroup?.id === contactGroup.id) {
								navigateTo(ROUTES_INTERNAL_PARAMS.route.contactGroups, { replace: true });
							}
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
		[activeContactGroup?.id, createModal, createSnackbar, navigateTo, removeStoredContactGroup, t]
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
