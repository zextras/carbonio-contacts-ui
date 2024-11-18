/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { copyToClipboard } from '../carbonio-ui-commons/utils/clipboard';
import { ACTION_IDS } from '../constants';

type CopyToClipboardAction = UIAction<string, never>;
export const useActionCopyToClipboard = (): CopyToClipboardAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const canExecute = useCallback<CopyToClipboardAction['canExecute']>(() => true, []);
	const execute = useCallback<CopyToClipboardAction['execute']>(
		(text) => {
			if (text) {
				copyToClipboard(text).then(() => {
					createSnackbar({
						key: `clipboard-copy-success-${Date.now()}`,
						replace: true,
						severity: 'success',
						hideButton: true,
						label: t('snackbar.email_copied_to_clipboard', 'Email copied to clipboard.')
					});
				});
			}
		},
		[createSnackbar, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.copyToClipboard,
			label: t('action.copy', 'Copy'),
			icon: 'Copy',
			canExecute,
			execute
		}),
		[canExecute, execute, t]
	);
};
