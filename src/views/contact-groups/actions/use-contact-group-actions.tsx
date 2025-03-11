/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useContactGroupDeleteAction } from './use-contact-group-delete-action';
import { useContactGroupEditAction } from './use-contact-group-edit-action';
import { useContactGroupSendEmailAction } from './use-contact-group-send-email-action';
import { useMoveContacts } from '../../../actions/common-contacts-actions/use-move-contacts';
import { useRestoreContacts } from '../../../actions/common-contacts-actions/use-restore-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { Action } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../../../model/contact-group';
import { getFolderFromContactGroup } from '../utils';

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
	const folderPartsId = getFolderIdParts(contactGroup.parent).id;
	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');
	if (isMainAccount || isSharedFolderWithWritePermission) {
		if (folderPartsId === FOLDERS.TRASH) {
			return [restoreContactsGroupAction, deletePermanentlyContactGroupAction];
		}

		return [
			sendEmailAction,
			editContactGroupAction,
			moveContactGroupAction,
			trashContactGroupAction
		];
	}

	return [sendEmailAction];
};
