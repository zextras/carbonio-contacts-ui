/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useActionDeleteContactGroup } from './delete-contact-group';
import { useActionEditCG } from './edit-cg';
import { useActionSendEmailCG } from './send-email-cg';
import { toEffectiveActions } from '../../../actions/common-contacts-actions/effective-actions';
import { useMoveContact } from '../../../actions/common-contacts-actions/use-move-contact';
import { useRestoreContact } from '../../../actions/common-contacts-actions/use-restore-contact';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contact';
import { UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../../../model/contact-group';
import { getFolderFromContactGroup } from '../utils';

const useMoveContactGroups = (contactGroup: ContactGroup): UIAction<void, void> => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.move_single.title', {
		contactDesc: contactGroup.title,
		defaultValue: "Move {{contactDesc}}'s contact"
	});
	return useMoveContact(contactGroup, modalTitle);
};

const useRestoreContactGroups = (contactGroup: ContactGroup): UIAction<void, void> => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.restore_single.title', {
		contactDesc: contactGroup.title,
		defaultValue: "Restore {{contactDesc}}'s contact"
	});
	return useRestoreContact(contactGroup, modalTitle);
};

export const useContactGroupActions = (contactGroup: ContactGroup): Array<DSAction> => {
	const deletePermanentlyContactGroupAction = useActionDeleteContactGroup(contactGroup);
	const moveContactGroupAction = useMoveContactGroups(contactGroup);
	const restoreContactsGroupAction = useRestoreContactGroups(contactGroup);
	const trashContactGroupAction = useTrashContacts([contactGroup]);
	const editContactGroupAction = useActionEditCG(contactGroup);
	const sendEmailAction = useActionSendEmailCG(contactGroup);
	const folder = getFolderFromContactGroup(contactGroup);
	const folderPartsId = getFolderIdParts(contactGroup.parent).id;
	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');

	if (isMainAccount || isSharedFolderWithWritePermission) {
		if (folderPartsId === FOLDERS.TRASH) {
			return toEffectiveActions([restoreContactsGroupAction, deletePermanentlyContactGroupAction]);
		}

		return toEffectiveActions([
			sendEmailAction,
			editContactGroupAction,
			moveContactGroupAction,
			trashContactGroupAction
		]);
	}

	return toEffectiveActions([sendEmailAction]);
};
