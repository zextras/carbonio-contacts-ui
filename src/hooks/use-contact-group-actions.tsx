/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';

import { DeleteCGAction, useActionDeleteCG } from '../actions/delete-cg';
import { EditActionCG, useActionEditCG } from '../actions/edit-cg';
import { SendEmailActionCG, useActionSendEmailCG } from '../actions/send-email-cg';
import { FOLDERS } from '../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { ROUTES_INTERNAL_PARAMS } from '../constants';
import { ContactGroup } from '../model/contact-group';

export const useContactGroupActions = (contactGroup: ContactGroup): DSAction[] => {
	const replaceHistory = useReplaceHistoryCallback();
	const { id } = useParams<{ id: string }>();
	const { zid: accountId } = getFolderIdParts(id);
	const onContactGroupDelete = (): void => {
		replaceHistory(
			`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId ?? FOLDERS.CONTACTS}/`
		);
	};

	const deleteCGAction = useActionDeleteCG(onContactGroupDelete);
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
