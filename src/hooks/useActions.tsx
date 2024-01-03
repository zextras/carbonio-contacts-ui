/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { type Action } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { ContactGroup } from '../model/contact-group';

export const useActions = (contactGroup: ContactGroup): Action[] => {
	const { id, title, members } = contactGroup;
	const [t] = useTranslation();

	const [openMailComposer, isMailAvailable] = useIntegratedFunction('composePrefillMessage');

	const sendMail = useCallback(() => {
		openMailComposer({ recipients: members.map((member) => ({ email: member })) });
	}, [members, openMailComposer]);

	return useMemo<Action[]>((): Action[] => {
		const orderedActions: Action[] = [
			{
				id: 'mail',
				label: t('action.mail', 'Mail'),
				icon: 'EmailOutline',
				onClick: sendMail
			}
		];
		return orderedActions;
	}, [sendMail, t]);
};
