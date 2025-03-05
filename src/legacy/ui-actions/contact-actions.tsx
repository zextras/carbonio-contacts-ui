/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SyntheticEvent } from 'react';

import { type Action as DSAction, Action, useModal } from '@zextras/carbonio-design-system';
import { getAction } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { compact, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { applyTag, applyMultiTag } from './tag-actions';
import { useActionDeleteContacts } from '../../actions/delete-contacts';
import { useActionExportContact } from '../../actions/export-contact';
import { useActionMoveContacts } from '../../actions/move-contacts';
import { useActionRestoreContacts } from '../../actions/restore-contacts';
import { useActionTrashContacts } from '../../actions/trash-contacts';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../carbonio-ui-commons/store/zustand/tags';
import { MakeOptional } from '../../types';
import { useEditAction } from '../../views/contacts/actions/common-contact-actions';
import { Contact, ContactOrGroup } from '../types/contact';

type OptionallyClickableAction = MakeOptional<DSAction, 'onClick'>;
type ContactActionsFn = (contact: Contact) => Array<OptionallyClickableAction>;
type SecondaryContactActionsFn = () => Array<OptionallyClickableAction>;

type InternalAction = NonNullable<ReturnType<typeof getAction>[0]> & { id: string };
const generateClickableAction = (action: InternalAction, params: unknown): DSAction => ({
	id: action.id,
	icon: action.icon,
	label: action.label,
	onClick: (ev: SyntheticEvent | KeyboardEvent): void => {
		if (ev) {
			ev.preventDefault();
		}
		action.execute(params);
	}
});

function mailToContact(contact: Contact, t: TFunction): Action | undefined {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	if (!available || !mailTo) {
		return undefined;
	}
	const { execute, ...action } = mailTo;
	return {
		...action,
		id: 'mail-to',
		onClick: execute,
		label: t('action.send_msg', 'Send e-mail'),
		disabled: isEmpty(contact?.email)
	};
}

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

export const useHoverActions = (contact: Contact): Array<DSAction> => {
	const [t] = useTranslation();
	const moveAction = useActionMoveContacts();
	const restoreAction = useActionRestoreContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();
	const folderId = contact.parent;
	const editAction = useEditAction(contact);

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return [
			...(restoreAction.canExecute([contact])
				? [generateClickableAction(restoreAction, { contacts: [contact] })]
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
