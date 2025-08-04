/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { isTrashed } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { useMoveContacts } from 'actions/common-contacts-actions/use-move-contacts';
import { useRestoreContacts } from 'actions/common-contacts-actions/use-restore-contacts';
import { useTrashContacts } from 'actions/common-contacts-actions/use-trash-contacts';
import { Action } from 'actions/types';
import { ContactGroup } from 'model/contact-group';
import { useContactGroupDeleteAction } from 'views/contact-groups/actions/use-contact-group-delete-action';
import { useContactGroupEditAction } from 'views/contact-groups/actions/use-contact-group-edit-action';
import { useContactGroupSendEmailAction } from 'views/contact-groups/actions/use-contact-group-send-email-action';
import { getFolderFromContactGroup } from 'views/contact-groups/utils';

const useMoveContactGroups = (contactGroup: ContactGroup): Action => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.move_single.title', {
		contactDesc: contactGroup.title,
		defaultValue: "Move {{contactDesc}}'s contact"
	});
	return useMoveContacts([contactGroup], modalTitle);
};

const useRestoreContactGroups = (contactGroup: ContactGroup): Action => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.restore_single.title', {
		contactDesc: contactGroup.title,
		defaultValue: "Restore {{contactDesc}}'s contact"
	});
	return useRestoreContacts([contactGroup], modalTitle);
};

export const useContactGroupActions = (contactGroup: ContactGroup): Array<DSAction> => {
	const deletePermanentlyContactGroupAction = useContactGroupDeleteAction(contactGroup);
	const moveContactGroupAction = useMoveContactGroups(contactGroup);
	const restoreContactsGroupAction = useRestoreContactGroups(contactGroup);
	const trashContactGroupAction = useTrashContacts([contactGroup]);
	const editContactGroupAction = useContactGroupEditAction(contactGroup);
	const sendEmailAction = useContactGroupSendEmailAction(contactGroup);

	const folder = getFolderFromContactGroup(contactGroup);
	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');
	const hasWritePermission = isMainAccount || isSharedFolderWithWritePermission;

	if (!folder) {
		return [];
	}

	if (isTrashed({ folder })) {
		if (hasWritePermission) {
			return [restoreContactsGroupAction, deletePermanentlyContactGroupAction];
		}
		return [];
	}

	if (hasWritePermission) {
		return [
			sendEmailAction,
			editContactGroupAction,
			moveContactGroupAction,
			trashContactGroupAction
		];
	}
	return [sendEmailAction];
};
