/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { DeleteCGAction } from '../actions/delete-cg';
import { EditActionCG } from '../actions/edit-cg';
import { SendEmailActionCG } from '../actions/send-email-cg';
import { ContactGroup } from '../model/contact-group';

export const useEvaluateContactGroupActions = (
	contactGroup: ContactGroup,
	deleteCGAction?: DeleteCGAction,
	sendEmailAction?: SendEmailActionCG,
	editCGAction?: EditActionCG
): DSAction[] =>
	useMemo<DSAction[]>((): DSAction[] => {
		const orderedActions: DSAction[] = [];

		if (sendEmailAction?.canExecute(contactGroup)) {
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
	}, [contactGroup, deleteCGAction, editCGAction, sendEmailAction]);
