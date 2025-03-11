/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';

import { useContactEditAction } from './use-contact-edit-actions';
import { useContactMoveAction } from './use-contact-move-action';
import { useContactRestoreAction } from './use-contact-restore-action';
import { useContactSendMailAction } from './use-contact-send-mail';
import { useDeletePermanentlyContacts } from '../../../actions/common-contacts-actions/use-delete-permanently-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export const useContactHoverActions = (contact: Contact): Array<DSAction> => {
	const folderId = contact.parent;
	const sendMailAction = useContactSendMailAction(contact);
	const moveAction = useContactMoveAction(contact);
	const restoreAction = useContactRestoreAction(contact);
	const deleteAction = useDeletePermanentlyContacts([contact]);
	const trashAction = useTrashContacts([contact]);
	const editAction = useContactEditAction(contact);

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return [restoreAction, deleteAction];
	}
	return [sendMailAction, editAction, moveAction, trashAction];
};
