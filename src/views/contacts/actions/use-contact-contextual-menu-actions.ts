/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { type Action as DSAction, useModal } from '@zextras/carbonio-design-system';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useContactSendMailAction } from './use-contact-send-mail';
import { useMoveSingleContact } from './use-move-single-contact';
import { useRestoreSingleContact } from './use-restore-single-contact';
import { useDeletePermanentlyContacts } from '../../../actions/common-contacts-actions/use-delete-permanently-contacts';
import { useTrashContacts } from '../../../actions/common-contacts-actions/use-trash-contacts';
import { useActionExportContact } from '../../../actions/export-contact';
import { generateClickableAction } from '../../../actions/generate-clickable-action';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../../carbonio-ui-commons/store/zustand/tags';
import { Contact } from '../../../legacy/types/contact';
import { applyTag } from '../../../legacy/ui-actions/tag-actions';

export const useContactsContextualMenuActions = (
	contact: Contact,
	folderId: string
): Array<DSAction> => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const tags = useTags();
	const sendMailAction = useContactSendMailAction(contact);
	const exportAction = useActionExportContact();
	const moveAction = useMoveSingleContact(contact);
	const restoreAction = useRestoreSingleContact(contact);
	const deleteAction = useDeletePermanentlyContacts([contact]);
	const trashAction = useTrashContacts([contact]);

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return [
			...(restoreAction.canExecute()
				? [generateClickableAction(restoreAction, { contacts: [contact] })]
				: []),
			...(deleteAction.canExecute() ? [generateClickableAction(deleteAction, [contact])] : []),
			...(exportAction.canExecute() ? [generateClickableAction(exportAction, contact)] : []),
			applyTag({ contact, tags, t, createModal, closeModal })
		];
	}
	return compact([
		...(sendMailAction.canExecute() ? [generateClickableAction(sendMailAction, contact)] : []),
		...(trashAction.canExecute() ? [generateClickableAction(trashAction, [contact])] : []),
		...(moveAction.canExecute()
			? [generateClickableAction(moveAction, { contacts: [contact] })]
			: []),
		...(exportAction.canExecute(contact) ? [generateClickableAction(exportAction, contact)] : []),
		applyTag({ contact, tags, t, createModal, closeModal })
	]);
};
