/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';

import { useTagsAction } from './single-contact-actions';
import { useContactEditAction } from './use-contact-edit-actions';
import { useContactSendMailAction } from './use-contact-send-mail';
import { useMoveSingleContact } from './use-move-single-contact';
import { useRestoreSingleContact } from './use-restore-single-contact';
import { toEffectiveActions } from '../../../actions/common-contacts-actions/effective-actions';
import { useDeletePermanentlyContacts } from '../../../actions/common-contacts-actions/use-delete-permanently-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export function useContactPreviewActions(contact: Contact): DSAction[] {
	const sendMailAction = useContactSendMailAction(contact);
	const tagsAction = useTagsAction(contact);
	const editAction = useContactEditAction(contact);
	const moveContact = useMoveSingleContact(contact);
	const trashAction = useTrashContacts([contact]);
	const deleteAction = useDeletePermanentlyContacts([contact]);
	const restoreContact = useRestoreSingleContact(contact);

	if (getFolderIdParts(contact.parent).id === FOLDERS.TRASH) {
		return toEffectiveActions([restoreContact, deleteAction]);
	}
	return toEffectiveActions([sendMailAction, tagsAction, editAction, moveContact, trashAction]);
}
