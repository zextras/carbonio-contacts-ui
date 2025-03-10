/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { getAction } from '@zextras/carbonio-shell-ui';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { UIAction } from '../../../actions/types';
import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export const useContactSendMailAction = (contact: Contact): UIAction<void, void> => {
	const [t] = useTranslation();
	const onMail = useCallback(() => {
		const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
		if (available && mailTo) {
			mailTo.execute(contact);
		}
	}, [contact]);
	return {
		id: 'send',
		icon: 'MailModOutline',
		label: t('action.mail', 'Send e-mail'),
		execute: onMail,
		canExecute: () => !isTrash(contact.parent),
		disabled: isEmpty(contact?.email)
	};
};
