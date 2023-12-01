/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { DefaultTheme } from 'styled-components';

import { ACTION_IDS } from '../constants';

type UIAction<ExecArg> = {
	id: string;
	label: string;
	icon: keyof DefaultTheme['icons'];
	execute: (arg: ExecArg) => void;
};

type EditDLAction = UIAction<{ name: string; email: string }>;

export const useActionEditDL = (): EditDLAction => {
	const [t] = useTranslation();
	const createModal = useModal();

	const callback = useCallback<EditDLAction['execute']>(
		(dl) => {
			const closeModal = createModal({
				title: t('modal.edit_distribution_list.title', 'Edit "{{name}}"', { name: dl.name }),
				confirmLabel: t('label.save', 'Save'),
				dismissLabel: t('label.cancel', 'Cancel'),
				size: 'medium',
				onClose: () => {
					closeModal();
				},
				children: <>Test</>
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
