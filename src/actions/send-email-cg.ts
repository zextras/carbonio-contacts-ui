/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useActionSendEmail } from './send-email';
import { UIAction } from './types';
import { ACTION_IDS } from '../constants';
import { ContactGroup } from '../model/contact-group';

export type SendEmailActionCG = UIAction<ContactGroup, ContactGroup>;

export const useActionSendEmailCG = (): SendEmailActionCG => {
	const [t] = useTranslation();
	const sendMailAction = useActionSendEmail();

	const canExecute = useCallback<SendEmailActionCG['canExecute']>(
		(contactGroup) =>
			contactGroup !== undefined && contactGroup.members.length > 0 && sendMailAction.canExecute(),
		[sendMailAction]
	);

	const sendEmail = useCallback<SendEmailActionCG['execute']>(
		(contactGroup) => {
			if (contactGroup === undefined) {
				return;
			}

			if (!canExecute(contactGroup)) {
				return;
			}

			sendMailAction.execute(contactGroup.members);
		},
		[canExecute, sendMailAction]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.sendEmailCG,
			label: t('action.mail', 'Send e-mail'),
			icon: 'EmailOutline',
			canExecute,
			execute: sendEmail
		}),
		[canExecute, sendEmail, t]
	);
};
