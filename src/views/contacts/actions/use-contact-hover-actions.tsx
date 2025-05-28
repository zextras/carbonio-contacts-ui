/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action as DSAction } from '@zextras/carbonio-design-system';

import { useContactEditAction } from './use-contact-edit-actions';
import { useContactMoveAction } from './use-contact-move-action';
import { useContactRestoreAction } from './use-contact-restore-action';
import { useContactSendMailAction } from './use-contact-send-mail-action';
import { useDeleteContacts } from '../../../actions/common-contacts-actions/use-delete-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { isTrashed } from '@zextras/carbonio-ui-commons';
import { Contact } from '../../../legacy/types/contact';
import { getFolderFromParent } from '../../contact-groups/utils';

export const useContactHoverActions = (contact: Contact): Array<DSAction> => {
	const sendMailAction = useContactSendMailAction(contact);
	const moveAction = useContactMoveAction(contact);
	const restoreAction = useContactRestoreAction(contact);
	const deleteAction = useDeleteContacts([contact]);
	const trashAction = useTrashContacts([contact]);
	const editAction = useContactEditAction(contact);

	const folder = getFolderFromParent(contact);
	if (!folder) {
		return [];
	}
	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');

	const hasWritePermission = isMainAccount || isSharedFolderWithWritePermission;
	if (isTrashed({ folder })) {
		if (hasWritePermission) {
			return [restoreAction, deleteAction];
		}
		return [];
	}

	if (hasWritePermission) {
		return [sendMailAction, editAction, moveAction, trashAction];
	}
	return [sendMailAction];
};
