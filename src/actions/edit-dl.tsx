/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { EditDLControllerComponent } from '../components/edit-dl-controller';
import { ACTION_IDS } from '../constants';
import { DistributionList } from '../model/distribution-list';

export type EditDLAction = UIAction<
	Pick<DistributionList, 'displayName' | 'email'>,
	Pick<DistributionList, 'isOwner'>
>;

export const useActionEditDL = (): EditDLAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const execute = useCallback<EditDLAction['execute']>(
		(distributionList) => {
			if (distributionList !== undefined) {
				const closeModal = createModal(
					{
						size: 'small',
						onClose: () => {
							closeModal();
						},
						children: (
							<EditDLControllerComponent
								email={distributionList.email}
								displayName={distributionList.displayName || distributionList.email}
								onClose={(): void => closeModal()}
								onSave={(): void => closeModal()}
							/>
						)
					},
					true
				);
			}
		},
		[createModal]
	);

	const canExecute = useCallback<EditDLAction['canExecute']>((dl) => dl?.isOwner === true, []);

	return useMemo(
		() => ({
			id: ACTION_IDS.editDL,
			label: t('action.edit_distribution_list', 'Edit distribution list'),
			icon: 'Settings2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
