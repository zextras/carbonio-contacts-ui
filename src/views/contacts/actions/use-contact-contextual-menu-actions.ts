/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from '@zextras/carbonio-design-system';

import { useContactExportAction } from './use-contact-export-action';
import { useContactMoveAction } from './use-contact-move-action';
import { useContactRestoreAction } from './use-contact-restore-action';
import { useContactSendMailAction } from './use-contact-send-mail-action';
import { useApplyTagsToContact } from '../../../actions/common-contacts-actions/use-apply-tag-contacts';
import { useDeleteContacts } from '../../../actions/common-contacts-actions/use-delete-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export const useContactsContextualMenuActions = (
	contact: Contact,
	folderId: string
): Array<Action> => {
	const sendMailAction = useContactSendMailAction(contact);
	const applyTagsAction = useApplyTagsToContact(contact);
	const exportAction = useContactExportAction(contact);
	const moveAction = useContactMoveAction(contact);
	const restoreAction = useContactRestoreAction(contact);
	const deleteAction = useDeleteContacts([contact]);
	const trashAction = useTrashContacts([contact]);

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		const effectiveActions: Array<Action> = [restoreAction, deleteAction];
		applyTagsAction && effectiveActions.push(applyTagsAction);
		return effectiveActions;
	}
	return [sendMailAction, trashAction, moveAction, exportAction, applyTagsAction];
};
