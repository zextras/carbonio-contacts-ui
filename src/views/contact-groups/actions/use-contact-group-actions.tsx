/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { DeleteCGAction, useActionDeleteContactGroup } from './delete-contact-group';
import { EditActionCG, useActionEditCG } from './edit-cg';
import { SendEmailActionCG, useActionSendEmailCG } from './send-email-cg';
import { DeletableItem, UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../../../model/contact-group';
import { MoveContactsAction, useActionMoveContacts } from '../../contacts/actions/move-contacts';
import {
	RestoreContactsAction,
	useActionRestoreContacts
} from '../../contacts/actions/restore-contacts';
import { ActionTrashContacts, useActionTrashContacts } from '../../contacts/actions/trash-contacts';
import { getFolderFromContactGroup } from '../utils';

function mapActionToDSAction<T>(action: UIAction<T, T>, items: T): DSAction | undefined {
	if (action.canExecute(items)) {
		return {
			id: action.id,
			label: action.label,
			onClick: (): void => {
				action.execute(items);
			},
			disabled: action.disabled,
			icon: action.icon,
			color: action.color
		};
	}
	return undefined;
}

function evaluateContactGroupActions<T extends DeletableItem>(
	contactGroup: T,
	actions: Array<UIAction<T, T>>
): DSAction[] {
	const orderedActions: DSAction[] = [];
	actions.forEach((action) => {
		const dsAction = mapActionToDSAction(action, contactGroup);
		dsAction && orderedActions.push(dsAction);
	});
	return orderedActions;
}

function getActionsInTrash(
	contactGroup: ContactGroup,
	deletePermanentlyContactGroupAction: DeleteCGAction,
	restoreContactsGroupActionDS: RestoreContactsAction
): Array<DSAction> {
	const actionsInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
		deletePermanentlyContactGroupAction
	]);

	const restoreDSAction = mapActionToDSAction(restoreContactsGroupActionDS, [contactGroup]);

	if (restoreDSAction) {
		actionsInTrash.unshift(restoreDSAction);
	}

	return actionsInTrash;
}

function getActionsNotInTrash(
	moveContactGroupAction: MoveContactsAction,
	trashContactGroupAction: ActionTrashContacts,
	contactGroup: ContactGroup,
	sendEmailAction: SendEmailActionCG,
	editContactGroupAction: EditActionCG
): Array<DSAction> {
	const trashActionDS = mapActionToDSAction<Array<ContactGroup>>(trashContactGroupAction, [
		contactGroup
	]);
	const actionsNotInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
		sendEmailAction,
		editContactGroupAction
	]);
	const moveActionDS = mapActionToDSAction(moveContactGroupAction, {
		contacts: [contactGroup]
	});
	moveActionDS && actionsNotInTrash.push(moveActionDS);
	trashActionDS && actionsNotInTrash.push(trashActionDS);
	return actionsNotInTrash;
}

export const useContactGroupActions = (contactGroup: ContactGroup): Array<DSAction> => {
	const deletePermanentlyContactGroupAction = useActionDeleteContactGroup();
	const editContactGroupAction = useActionEditCG();
	const sendEmailAction = useActionSendEmailCG(contactGroup);
	const trashContactGroupAction = useActionTrashContacts();
	const moveContactGroupAction = useActionMoveContacts();
	const restoreContactsGroupAction = useActionRestoreContacts();
	const folder = getFolderFromContactGroup(contactGroup);
	const folderPartsId = getFolderIdParts(contactGroup.parent).id;
	const isMainAccount = !folder?.perm;

	if (isMainAccount || folder?.perm?.includes('w')) {
		if (folderPartsId === FOLDERS.TRASH) {
			return getActionsInTrash(
				contactGroup,
				deletePermanentlyContactGroupAction,
				restoreContactsGroupAction
			);
		}

		return getActionsNotInTrash(
			moveContactGroupAction,
			trashContactGroupAction,
			contactGroup,
			sendEmailAction,
			editContactGroupAction
		);
	}

	return evaluateContactGroupActions<ContactGroup>(contactGroup, [sendEmailAction]);
};
