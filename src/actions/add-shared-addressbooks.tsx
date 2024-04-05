/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { SharesModal } from '../components/modals/shares/shares-modal';
import { ACTION_IDS } from '../constants';
import { StoreProvider } from '../legacy/store/redux';

export type AddSharedAddressbooksAction = UIAction<never, never>;

export const useActionAddSharedAddressbooks = (): AddSharedAddressbooksAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const execute = useCallback<AddSharedAddressbooksAction['execute']>(() => {
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<SharesModal onClose={() => closeModal()} />
					</StoreProvider>
				)
			},
			true
		);
	}, [createModal]);

	const canExecute = useCallback<AddSharedAddressbooksAction['canExecute']>(() => true, []);

	return useMemo(
		() => ({
			id: ACTION_IDS.addSharedAddressbooks,
			label: t('action.add_shared_addressbooks', 'Add shares'),
			icon: '',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
