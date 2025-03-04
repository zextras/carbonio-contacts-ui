/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';

import {
	useDeleteAction,
	useEditAction,
	useMoveAction,
	useSendMailAction,
	useTagsAction
} from './common-contact-actions';
import { Contact } from '../../../legacy/types/contact';

export function useContactPreviewActions(contact: Contact): DSAction[] {
	const sendMailAction = useSendMailAction(contact);
	const editAction = useEditAction(contact);
	const deleteAction = useDeleteAction(contact);
	const moveOrRestoreAction = useMoveAction(contact);
	const tagsActions = useTagsAction(contact);
	const actions = [sendMailAction, tagsActions, editAction, moveOrRestoreAction, deleteAction];
	const orderedActions: DSAction[] = [];
	actions.forEach((action) => {
		if (action.canExecute(contact)) {
			orderedActions.push({
				id: action.id,
				label: action.label,
				onClick: () => {
					action.execute(contact);
				},
				icon: action.icon,
				color: action.color,
				disabled: action.disabled
			});
		}
	});
	return orderedActions;
}
