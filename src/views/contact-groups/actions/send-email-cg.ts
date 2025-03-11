/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useActionSendEmail } from '../../../actions/send-email';
import { Action } from '../../../actions/types';
import { ACTION_IDS } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';

export const useActionSendEmailCG = (contactGroup: ContactGroup): Action => {
	const [t] = useTranslation();
	const sendMailAction = useActionSendEmail();

	const isDisabled = contactGroup.members.length === 0;
	const sendEmail = useCallback(() => {
		if (isDisabled) {
			return;
		}

		sendMailAction.execute(contactGroup.members);
	}, [contactGroup, isDisabled, sendMailAction]);

	return useMemo(
		() => ({
			id: ACTION_IDS.sendEmailCG,
			label: t('action.mail', 'Send e-mail'),
			icon: 'EmailOutline',
			onClick: sendEmail,
			disabled: isDisabled
		}),
		[isDisabled, sendEmail, t]
	);
};
