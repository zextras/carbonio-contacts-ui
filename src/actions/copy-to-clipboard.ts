/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS } from '../constants';

const copyToClipboard = (text: string): Promise<void> => {
	if (!window.parent.navigator.clipboard) {
		const textArea = window.parent.document.createElement('textarea');
		window.parent.document.body.appendChild(textArea);
		textArea.value = text;
		textArea.select();
		const success = window.parent.document.execCommand('copy');
		window.parent.document.body.removeChild(textArea);
		return new Promise<void>((resolve, reject) => {
			success ? resolve() : reject();
		});
	}

	return window.parent.navigator.clipboard.writeText(text);
};

type CopyToClipboardAction = UIAction<string, never>;
export const useActionCopyToClipboard = (): CopyToClipboardAction => {
	const [t] = useTranslation();
	const canExecute = useCallback<CopyToClipboardAction['canExecute']>(() => true, []);
	const execute = useCallback<CopyToClipboardAction['execute']>((text) => {
		if (text) {
			copyToClipboard(text);
		}
	}, []);

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
