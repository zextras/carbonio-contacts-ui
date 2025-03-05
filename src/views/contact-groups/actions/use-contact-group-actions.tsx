/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionDeleteContactGroup } from './delete-contact-group';
import { useActionEditCG } from './edit-cg';
import { useActionSendEmailCG } from './send-email-cg';
import { useActionRestoreContacts } from '../../../actions/restore-contacts';
import { useActionTrashContacts } from '../../../actions/trash-contacts';
import { DeletableItem, UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../../../model/contact-group';
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

export const useContactGroupActions = (contactGroup: ContactGroup): Array<DSAction> => {
	const deletePermanentlyContactGroupAction = useActionDeleteContactGroup();
	const editContactGroupAction = useActionEditCG();
	const sendEmailAction = useActionSendEmailCG(contactGroup);
	const trashContactGroupAction = useActionTrashContacts();
	const restoreContactsGroupAction = useActionRestoreContacts();
	const folder = getFolderFromContactGroup(contactGroup);
	const folderPartsId = getFolderIdParts(contactGroup.parent).id;
	const isMainAccount = !folder?.perm;

	const restoreContactsGroupActionDS = mapActionToDSAction<Array<ContactGroup>>(
		restoreContactsGroupAction,
		[contactGroup]
	);
	if (isMainAccount) {
		if (folderPartsId === FOLDERS.TRASH) {
			const mainAccountActionsInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
				deletePermanentlyContactGroupAction
			]);

			if (restoreContactsGroupActionDS) {
				mainAccountActionsInTrash.unshift(restoreContactsGroupActionDS);
			}

			return mainAccountActionsInTrash;
		}

		const trashActionDS = mapActionToDSAction<Array<ContactGroup>>(trashContactGroupAction, [
			contactGroup
		]);
		const mainAccountActionsNotInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
			sendEmailAction,
			editContactGroupAction
		]);
		trashActionDS && mainAccountActionsNotInTrash.push(trashActionDS);
		return mainAccountActionsNotInTrash;
	}
	if (folder?.perm?.includes('w')) {
		if (folderPartsId === FOLDERS.TRASH) {
			return evaluateContactGroupActions<ContactGroup>(contactGroup, [
				deletePermanentlyContactGroupAction
			]);
		}
		const trashActionDS = mapActionToDSAction<Array<ContactGroup>>(trashContactGroupAction, [
			contactGroup
		]);
		const sharedFolderActionsNotInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
			sendEmailAction,
			editContactGroupAction
		]);
		trashActionDS && sharedFolderActionsNotInTrash.push(trashActionDS);
		return sharedFolderActionsNotInTrash;
	}
	return evaluateContactGroupActions<ContactGroup>(contactGroup, [sendEmailAction]);
};
