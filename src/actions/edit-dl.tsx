/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { DefaultTheme } from 'styled-components';

import { EditDLControllerComponent } from '../components/edit-dl-controller';
import { ACTION_IDS } from '../constants';

export type UIAction<ExecArg> = {
	id: string;
	label: string;
	icon: keyof DefaultTheme['icons'];
	execute: (arg: ExecArg) => void;
};

export type EditDLAction = UIAction<{ displayName: string; email: string }>;

export const useActionEditDL = (): EditDLAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const callback = useCallback<EditDLAction['execute']>(
		({ email, displayName }) => {
			const closeModal = createModal({
				title: t('modal.edit_distribution_list.title', 'Edit "{{displayName}}"', { displayName }),
				size: 'medium',
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
				),
				hideFooter: true
			});
		},
		[createModal, t]
	);

	return {
		id: ACTION_IDS.EDIT_DL,
		label: t('action.edit_distribution_list', 'Edit address list'),
		icon: 'Edit2Outline',
		execute: callback
	};
};
