/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';

import { useContactEditAction } from './use-contact-edit-actions';
import { useContactMoveAction } from './use-contact-move-action';
import { useContactRestoreAction } from './use-contact-restore-action';
import { useContactSendMailAction } from './use-contact-send-mail-action';
import { useDeleteContacts } from '../../../actions/common-contacts-actions/use-delete-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';
import { getFolderFromParent } from '../../contact-groups/utils';

export const useContactHoverActions = (contact: Contact): Array<DSAction> => {
	const folderId = contact.parent;
	const sendMailAction = useContactSendMailAction(contact);
	const moveAction = useContactMoveAction(contact);
	const restoreAction = useContactRestoreAction(contact);
	const deleteAction = useDeleteContacts([contact]);
	const trashAction = useTrashContacts([contact]);
	const editAction = useContactEditAction(contact);

	const folder = getFolderFromParent(contact);
	const folderPartsId = getFolderIdParts(folderId).id;
	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');

	if (isMainAccount || isSharedFolderWithWritePermission) {
		if (folderPartsId === FOLDERS.TRASH) {
			return [restoreAction, deleteAction];
		}
		return [sendMailAction, editAction, moveAction, trashAction];
	}
	return [sendMailAction];
};
