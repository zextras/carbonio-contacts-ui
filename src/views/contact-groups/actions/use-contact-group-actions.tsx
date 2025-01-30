/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { EditActionCG, useActionEditCG } from '../../../actions/edit-cg';
import { SendEmailActionCG, useActionSendEmailCG } from '../../../actions/send-email-cg';
import { UIAction } from '../../../actions/types';
import { ContactGroup } from '../../../model/contact-group';
import { useActionDeleteContactGroup } from '../api/delete-contact-group';

function evaluateContactGroupActions<T extends ContactGroup>(
	contactGroup: T,
	deleteCGAction: UIAction<T, never>,
	editCGAction: EditActionCG,
	sendEmailAction: SendEmailActionCG
): DSAction[] {
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
	if (editCGAction?.canExecute()) {
		orderedActions.push({
			id: editCGAction.id,
			label: editCGAction.label,
			icon: editCGAction.icon,
			onClick: () => {
				editCGAction.execute(contactGroup);
			}
		});
	}
	if (deleteCGAction?.canExecute()) {
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
}

export const useContactGroupActions = (): ((contactGroup: ContactGroup) => DSAction[]) => {
	const deleteCGAction = useActionDeleteContactGroup();
	const editCGAction = useActionEditCG();
	const sendEmailAction = useActionSendEmailCG();
	return (contactGroup: ContactGroup): DSAction[] =>
		evaluateContactGroupActions<ContactGroup>(
			contactGroup,
			deleteCGAction,
			editCGAction,
			sendEmailAction
		);
};
