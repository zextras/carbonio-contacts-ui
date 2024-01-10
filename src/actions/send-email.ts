/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS } from '../constants';

export type MailComposerRecipient = { email?: string; isGroup?: boolean };
export type OpenMailComposerIntegratedFunction = (arg: {
	recipients: Array<MailComposerRecipient>;
}) => void;

export type SendEmailAction = UIAction<Array<string | MailComposerRecipient>, never>;

export const useActionSendEmail = (): SendEmailAction => {
	const [t] = useTranslation();

	// FIXME: remove cast when shell will have generics
	const [openMailComposer, isMailAvailable] = useIntegratedFunction('composePrefillMessage') as [
		OpenMailComposerIntegratedFunction,
		boolean
	];

	const sendEmail = useCallback<SendEmailAction['execute']>(
		(recipients) => {
			if (recipients) {
				openMailComposer({
					recipients: recipients.map((recipient) =>
						typeof recipient === 'string' ? { email: recipient } : recipient
					)
				});
			}
		},
		[openMailComposer]
	);

	const canExecute = useCallback<SendEmailAction['canExecute']>(
		() => isMailAvailable,
		[isMailAvailable]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.sendEmail,
			label: t('action.mail', 'Send e-mail'),
			icon: 'EmailOutline',
			canExecute,
			execute: sendEmail
		}),
		[canExecute, sendEmail, t]
	);
};
