/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useActionSendEmail } from '../../../actions/send-email';
import { Action } from '../../../actions/types';
import { SEND_EMAIL_ACTION } from '../../../constants/actions';
import { ContactGroup } from '../../../model/contact-group';

export const useContactGroupSendEmailAction = (contactGroup: ContactGroup): Action => {
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
			id: SEND_EMAIL_ACTION.ID,
			label: t('action.mail', 'Send e-mail'),
			icon: SEND_EMAIL_ACTION.ICON,
			onClick: sendEmail,
			disabled: isDisabled
		}),
		[isDisabled, sendEmail, t]
	);
};
