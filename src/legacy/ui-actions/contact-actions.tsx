/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction, useModal } from '@zextras/carbonio-design-system';
import { compact } from 'lodash';
import { useTranslation } from 'react-i18next';

import { applyMultiTag, applyTag } from './tag-actions';
import { useActionExportContact } from '../../actions/export-contact';
import { generateClickableAction } from '../../actions/generate-clickable-action';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../carbonio-ui-commons/store/zustand/tags';
import { MakeOptional } from '../../types';
import { useActionDeleteContacts } from '../../views/contacts/actions/delete-contacts';
import { useActionMoveContacts } from '../../views/contacts/actions/move-contacts';
import { useActionRestoreContacts } from '../../views/contacts/actions/restore-contacts';
import { mailToContact } from '../../views/contacts/actions/single-contact-actions';
import { useActionTrashContacts } from '../../views/contacts/actions/trash-contacts';
import { Contact, ContactOrGroup } from '../types/contact';

type OptionallyClickableAction = MakeOptional<DSAction, 'onClick'>;
type ContactActionsFn = (contact: Contact) => Array<OptionallyClickableAction>;
type SecondaryContactActionsFn = () => Array<OptionallyClickableAction>;

export const useContextActions = (folderId: string): ContactActionsFn => {
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

type SecondaryActionsProps = {
	folderId: string;
	deselectAll: () => void;
	selectedContacts: Array<ContactOrGroup>;
	ids: Array<string>;
};
export const useMultipleSelectionActions = ({
	folderId,
	deselectAll,
	selectedContacts,
	ids
}: SecondaryActionsProps): SecondaryContactActionsFn => {
	const [t] = useTranslation();
	const tags = useTags();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return () => [
			...(deleteAction.canExecute(selectedContacts)
				? [generateClickableAction(deleteAction, selectedContacts)]
				: []),

			applyMultiTag({
				t,
				tags,
				ids,
				itemsToTag: selectedContacts,
				deselectAll,
				folderId
			})
		];
	}
	return () => [
		...(trashAction.canExecute(selectedContacts)
			? [generateClickableAction(trashAction, selectedContacts)]
			: []),
		applyMultiTag({
			t,
			tags,
			ids,
			itemsToTag: selectedContacts,
			deselectAll,
			folderId
		})
	];
};
