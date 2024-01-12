/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { useActionDeleteCG } from '../actions/delete-cg';
import { ContactGroup } from '../model/contact-group';

export const useContactGroupActions = (contactGroup: ContactGroup): DSAction[] => {
	const { id, title, members } = contactGroup;
	const [t] = useTranslation();

	const deleteCGAction = useActionDeleteCG();

	const [openMailComposer, isMailAvailable] = useIntegratedFunction('composePrefillMessage');

	const sendMail = useCallback(() => {
		openMailComposer({ recipients: members.map((member) => ({ email: member })) });
	}, [members, openMailComposer]);

	return useMemo<DSAction[]>((): DSAction[] => {
		const orderedActions: DSAction[] = [];
		if (contactGroup.members.length > 0) {
			orderedActions.push({
				id: 'send-email',
				label: t('action.send_msg', 'Send e-mail'),
				icon: 'EmailOutline',
				onClick: sendMail
			});
		}
		if (deleteCGAction.canExecute()) {
			orderedActions.push({
				id: deleteCGAction.id,
				label: deleteCGAction.label,
				onClick: () => {
					deleteCGAction.execute(contactGroup);
				},
				icon: deleteCGAction.icon
			});
		}
		return orderedActions;
	}, [contactGroup, deleteCGAction, sendMail, t]);
};
