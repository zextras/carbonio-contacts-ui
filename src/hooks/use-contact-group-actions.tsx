/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionDeleteCG } from '../actions/delete-cg';
import { useActionEditCG } from '../actions/edit-cg';
import { useActionSendEmailCG } from '../actions/send-email-cg';
import { ContactGroup } from '../model/contact-group';

export const useContactGroupActions = (contactGroup: ContactGroup): DSAction[] => {
	const deleteCGAction = useActionDeleteCG();
	const sendEmailAction = useActionSendEmailCG();
	const editCGAction = useActionEditCG();

	return useMemo<DSAction[]>((): DSAction[] => {
		const orderedActions: DSAction[] = [];

		if (sendEmailAction.canExecute(contactGroup)) {
			orderedActions.push({
				id: sendEmailAction.id,
				label: sendEmailAction.label,
				onClick: () => {
					sendEmailAction.execute(contactGroup);
				},
				icon: sendEmailAction.icon
			});
		}
		if (editCGAction.canExecute()) {
			orderedActions.push({
				id: editCGAction.id,
				label: editCGAction.label,
				icon: editCGAction.icon,
				onClick: () => {
					editCGAction.execute(contactGroup);
				}
			});
		}
		if (deleteCGAction.canExecute()) {
			orderedActions.push({
				id: deleteCGAction.id,
				label: deleteCGAction.label,
				onClick: () => {
					deleteCGAction.execute(contactGroup);
				},
				icon: deleteCGAction.icon,
				color: deleteCGAction.color
			});
		}
		return orderedActions;
	}, [contactGroup, deleteCGAction, editCGAction, sendEmailAction]);
};
