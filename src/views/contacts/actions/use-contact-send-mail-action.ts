/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { getAction } from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Action } from '../../../actions/types';
import { SEND_EMAIL_ACTION } from '../../../constants/actions';
import { Contact } from '../../../legacy/types/contact';

export const useContactSendMailAction = (contact: Contact): Action => {
	const [t] = useTranslation();
	const onMail = useCallback(() => {
		const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
		if (available && mailTo) {
			mailTo.execute(contact);
		}
	}, [contact]);
	return {
		id: SEND_EMAIL_ACTION.ID,
		icon: 'MailModOutline',
		label: t('action.mail', 'Send e-mail'),
		onClick: onMail,
		disabled: isEmpty(contact?.email)
	};
};
