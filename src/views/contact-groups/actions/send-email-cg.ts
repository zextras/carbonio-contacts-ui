/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useActionSendEmail } from '../../../actions/send-email';
import { UIAction } from '../../../actions/types';
import { ACTION_IDS } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';

export type SendEmailActionCG = UIAction<ContactGroup, ContactGroup>;

export const useActionSendEmailCG = (contactGroup: ContactGroup): SendEmailActionCG => {
	const [t] = useTranslation();
	const sendMailAction = useActionSendEmail();

	const canExecute = useCallback<SendEmailActionCG['canExecute']>(
		() => contactGroup !== undefined && sendMailAction.canExecute(),
		[contactGroup, sendMailAction]
	);
	const isDisabled = !(contactGroup.members.length > 0);
	const sendEmail = useCallback<SendEmailActionCG['execute']>(() => {
		if (contactGroup === undefined) {
			return;
		}

		if (!canExecute(contactGroup) || isDisabled) {
			return;
		}

		sendMailAction.execute(contactGroup.members);
	}, [canExecute, contactGroup, isDisabled, sendMailAction]);

	return useMemo(
		() => ({
			id: ACTION_IDS.sendEmailCG,
			label: t('action.mail', 'Send e-mail'),
			icon: 'EmailOutline',
			canExecute,
			execute: sendEmail,
			disabled: isDisabled
		}),
		[canExecute, contactGroup.members.length, sendEmail, t]
	);
};
