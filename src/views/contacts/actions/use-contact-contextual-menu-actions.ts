/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type Action as DSAction, useModal } from '@zextras/carbonio-design-system';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useActionDeleteContacts } from './delete-contacts';
import { useActionMoveContacts } from './move-contacts';
import { useActionRestoreContacts } from './restore-contacts';
import { mailToContact } from './single-contact-actions';
import { useActionTrashContacts } from './trash-contacts';
import { useActionExportContact } from '../../../actions/export-contact';
import { generateClickableAction } from '../../../actions/generate-clickable-action';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../../carbonio-ui-commons/store/zustand/tags';
import { Contact } from '../../../legacy/types/contact';
import { applyTag } from '../../../legacy/ui-actions/tag-actions';

type ContactActionsFn = (contact: Contact) => Array<DSAction>;

export const useContactsContextualMenuActions = (folderId: string): ContactActionsFn => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const tags = useTags();
	const exportAction = useActionExportContact();
	const moveAction = useActionMoveContacts();
	const restoreAction = useActionRestoreContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return (contact: Contact) => [
			...(restoreAction.canExecute([contact])
				? [generateClickableAction(restoreAction, { contacts: [contact] })]
				: []),
			...(deleteAction.canExecute([contact])
				? [generateClickableAction(deleteAction, [contact])]
				: []),
			...(exportAction.canExecute() ? [generateClickableAction(exportAction, contact)] : []),
			applyTag({ contact, tags, t, createModal, closeModal })
		];
	}
	return (contact: Contact) =>
		compact([
			...(exportAction.canExecute() ? [generateClickableAction(exportAction, contact)] : []),
			...(trashAction.canExecute([contact])
				? [generateClickableAction(trashAction, [contact])]
				: []),
			mailToContact(contact, t),
			...(moveAction.canExecute({ contacts: [contact] })
				? [generateClickableAction(moveAction, { contacts: [contact] })]
				: []),
			...(exportAction.canExecute(contact) ? [generateClickableAction(exportAction, contact)] : []),
			applyTag({ contact, tags, t, createModal, closeModal })
		]);
};
