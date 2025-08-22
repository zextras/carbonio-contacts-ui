/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';
import { isTrashed } from '@zextras/carbonio-ui-commons';

import { useContactEditAction } from 'views/contacts/actions/use-contact-edit-actions';
import { useContactMoveAction } from 'views/contacts/actions/use-contact-move-action';
import { useContactRestoreAction } from 'views/contacts/actions/use-contact-restore-action';
import { useContactSendMailAction } from 'views/contacts/actions/use-contact-send-mail-action';
import { useContactShowTagAction } from 'views/contacts/actions/use-contact-show-tag-action';
import { useDeleteContacts } from 'actions/common-contacts-actions/use-delete-contacts';
import { useTrashContacts } from 'actions/common-contacts-actions/use-trash-contacts';
import { Contact } from 'legacy/types/contact';
import { getFolderFromParent } from 'views/contact-groups/utils';

export function useContactPreviewActions(contact: Contact): DSAction[] {
	const sendMailAction = useContactSendMailAction(contact);
	const showTag = useContactShowTagAction(contact);
	const editAction = useContactEditAction(contact);
	const moveContact = useContactMoveAction(contact);
	const trashAction = useTrashContacts([contact]);
	const deleteAction = useDeleteContacts([contact]);
	const restoreContact = useContactRestoreAction(contact);
	const folder = getFolderFromParent(contact);
	if (!folder) {
		return [];
	}

	const isMainAccount = !folder?.perm;
	const isSharedFolderWithWritePermission = folder?.perm?.includes('w');

	const hasWritePermission = isMainAccount || isSharedFolderWithWritePermission;
	if (isTrashed({ folder })) {
		return hasWritePermission ? [restoreContact, deleteAction] : [];
	}
	if (hasWritePermission) {
		const actions = [sendMailAction];
		showTag && actions.push(showTag);
		actions.push(...[editAction, moveContact, trashAction]);
		return actions;
	}
	return [sendMailAction, ...(showTag ? [showTag] : [])];
}
