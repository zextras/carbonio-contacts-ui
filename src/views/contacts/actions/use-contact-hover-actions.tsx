/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action as DSAction } from '@zextras/carbonio-design-system';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useActionDeleteContacts } from './delete-contacts';
import { useActionMoveContacts } from './move-contacts';
import { useActionRestoreContacts } from './restore-contacts';
import { mailToContact, useEditAction } from './single-contact-actions';
import { useActionTrashContacts } from './trash-contacts';
import { generateClickableAction } from '../../../actions/generate-clickable-action';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export const useContactHoverActions = (contact: Contact): Array<DSAction> => {
	const [t] = useTranslation();
	const folderId = contact.parent;
	const moveAction = useActionMoveContacts();
	const restoreAction = useActionRestoreContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();
	const editAction = useEditAction(contact);

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return [
			...(restoreAction.canExecute([contact])
				? [generateClickableAction(restoreAction, [contact])]
				: []),
			...(deleteAction.canExecute([contact])
				? [generateClickableAction(deleteAction, [contact])]
				: [])
		];
	}
	return compact([
		mailToContact(contact, t),
		...(editAction.canExecute(contact) ? [generateClickableAction(editAction, [contact])] : []),
		...(moveAction.canExecute({ contacts: [contact] })
			? [generateClickableAction(moveAction, { contacts: [contact] })]
			: []),
		...(trashAction.canExecute([contact]) ? [generateClickableAction(trashAction, [contact])] : [])
	]);
};
