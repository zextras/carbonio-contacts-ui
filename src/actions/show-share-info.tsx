/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { isLink } from '../carbonio-ui-commons/helpers/folders';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ShareInfoModal } from '../components/modals/share-info-modal';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

export type ShowShareInfoAction = UIAction<Folder, Folder>;

export const useActionShowShareInfo = (): ShowShareInfoAction => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const canExecute = useCallback<ShowShareInfoAction['canExecute']>(
		(addressBook?: Folder): boolean => {
			if (!addressBook) {
				return false;
			}

			return isLink(addressBook);
		},
		[]
	);

	const execute = useCallback<ShowShareInfoAction['execute']>(
		(addressBook) => {
			if (!addressBook) {
				return;
			}

			if (!canExecute(addressBook)) {
				return;
			}

			const modalId = 'show-share-info';
			createModal(
				{
					id: modalId,
					maxHeight: '90vh',
					children: (
						<StoreProvider>
							<ShareInfoModal addressBook={addressBook} onClose={(): void => closeModal(modalId)} />
						</StoreProvider>
					)
				},
				true
			);
		},
		[canExecute, closeModal, createModal]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.showShareInfo,
			label: t('share.share_info', "Shared address book's info"),
			icon: 'InfoOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
