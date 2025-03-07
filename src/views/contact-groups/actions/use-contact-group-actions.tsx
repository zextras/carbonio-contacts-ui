/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import { type Action as DSAction, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DeleteCGAction, useActionDeleteContactGroup } from './delete-contact-group';
import { EditActionCG, useActionEditCG } from './edit-cg';
import { SendEmailActionCG, useActionSendEmailCG } from './send-email-cg';
import { useMoveItemAction } from '../../../actions/move-items';
import { DeletableItem, UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Folder } from '../../../carbonio-ui-commons/types';
import { ACTION_IDS, TIMEOUTS } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';
import { apiClient } from '../../../network/api-client';
import { ActionTrashContacts, useActionTrashContacts } from '../../contacts/actions/trash-contacts';
import { getFolderFromContactGroup } from '../utils';

function mapActionToDSAction<T>(action: UIAction<T, T>, items?: T): DSAction | undefined {
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
	restoreContactsGroupActionDS: UIAction<ContactGroup, ContactGroup>
): Array<DSAction> {
	const actionsInTrash = evaluateContactGroupActions<ContactGroup>(contactGroup, [
		deletePermanentlyContactGroupAction
	]);

	const restoreDSAction = mapActionToDSAction(restoreContactsGroupActionDS);

	if (restoreDSAction) {
		actionsInTrash.unshift(restoreDSAction);
	}

	return actionsInTrash;
}

function getActionsNotInTrash(
	moveContactGroupAction: UIAction<ContactGroup, ContactGroup>,
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
	const moveActionDS = mapActionToDSAction(moveContactGroupAction);
	moveActionDS && actionsNotInTrash.push(moveActionDS);
	trashActionDS && actionsNotInTrash.push(trashActionDS);
	return actionsNotInTrash;
}
const useMoveContactGroups = (contactGroup: ContactGroup): UIAction<ContactGroup, ContactGroup> => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const move = useCallback(
		(contactsIds: Array<string>, parentAddressBookId: string): Promise<void> =>
			apiClient
				.moveContact(contactsIds, parentAddressBookId)
				.then(() => {
					createSnackbar({
						key: `move-contact-success`,
						replace: true,
						severity: 'success',
						label: t('messages.snackbar.contact_moved', 'Contact moved'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				})
				.catch(() => {
					createSnackbar({
						key: `move-contact-error`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				}),
		[createSnackbar, t]
	);
	const moveModal = {
		id: ACTION_IDS.moveContacts,
		confirmButtonLabel: t('label.move', 'Move'),
		title: 'Move contact group'
	};
	const contactGroupIds = [contactGroup.id];
	const action = useMoveItemAction({
		actionId: ACTION_IDS.move,
		label: t('label.move', 'Move'),
		modal: moveModal,
		icon: 'MoveOutline',
		onMoveConfirm: (targetFolder: Folder) => move(contactGroupIds, targetFolder.id)
	});
	return { ...action, canExecute: () => true };
};

const useRestoreContactGroups = (
	contactGroup: ContactGroup
): UIAction<ContactGroup, ContactGroup> => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const move = useCallback(
		(contactsIds: Array<string>, parentAddressBookId: string): Promise<void> =>
			apiClient
				.moveContact(contactsIds, parentAddressBookId)
				.then(() => {
					createSnackbar({
						key: `move-contact-success`,
						replace: true,
						severity: 'success',
						label: t('messages.snackbar.contact_restored', 'Contact restored'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				})
				.catch(() => {
					createSnackbar({
						key: `move-contact-error`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				}),
		[createSnackbar, t]
	);
	const restoreModal = {
		id: ACTION_IDS.restoreContacts,
		confirmButtonLabel: t('label.restore', 'Restore'),
		title: 'Restore contact group'
	};
	const contactGroupIds = [contactGroup.id];
	const action = useMoveItemAction({
		actionId: ACTION_IDS.restoreContacts,
		label: t('label.restore', 'Restore'),
		modal: restoreModal,
		icon: 'RestoreOutline',
		onMoveConfirm: (targetFolder: Folder) => move(contactGroupIds, targetFolder.id)
	});
	return { ...action, canExecute: () => true };
};

export const useContactGroupActions = (contactGroup: ContactGroup): Array<DSAction> => {
	const deletePermanentlyContactGroupAction = useActionDeleteContactGroup(contactGroup);
	const moveContactGroupAction = useMoveContactGroups(contactGroup);
	const restoreContactsGroupAction = useRestoreContactGroups(contactGroup);
	const trashContactGroupAction = useActionTrashContacts();
	const editContactGroupAction = useActionEditCG();
	const sendEmailAction = useActionSendEmailCG(contactGroup);
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
