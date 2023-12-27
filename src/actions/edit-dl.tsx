/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { DefaultTheme } from 'styled-components';

import { EditDLControllerComponent } from '../components/edit-dl-controller';
import { ACTION_IDS } from '../constants';
import { DistributionList } from '../model/distribution-list';

export type UIAction<ExecArg, CanExecArg> = {
	id: string;
	label: string;
	icon: keyof DefaultTheme['icons'];
	execute: (arg: ExecArg) => void;
	canExecute: (arg: CanExecArg) => boolean;
};

export type EditDLAction = UIAction<
	Pick<DistributionList, 'displayName' | 'email'>,
	Pick<DistributionList, 'isOwner'>
>;

export const useActionEditDL = (): EditDLAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const execute = useCallback<EditDLAction['execute']>(
		({ email, displayName = email }) => {
			const closeModal = createModal(
				{
					size: 'small',
					onClose: () => {
						closeModal();
					},
					children: (
						<EditDLControllerComponent
							email={email}
							displayName={displayName}
							onClose={(): void => closeModal()}
							onSave={(): void => closeModal()}
						/>
					)
				},
				true
			);
		},
		[createModal]
	);

	const canExecute = useCallback<EditDLAction['canExecute']>(({ isOwner }) => isOwner, []);

	return useMemo(
		() => ({
			id: ACTION_IDS.EDIT_DL,
			label: t('action.edit_distribution_list', 'Edit distribution list'),
			icon: 'Edit2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
