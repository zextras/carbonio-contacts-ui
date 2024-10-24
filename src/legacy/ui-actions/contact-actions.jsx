/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useModal } from '@zextras/carbonio-design-system';
import { getAction, useTags } from '@zextras/carbonio-shell-ui';
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

const generateClickableAction = (action, params) => ({
	id: action.id,
	icon: action.icon,
	label: action.label,
	onClick: (ev) => {
		if (ev) {
			ev.preventDefault();
		}
		action.execute(params);
	}
});

export function mailToContact(contact, t) {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	return available
		? {
				...mailTo,
				onClick: mailTo.execute,
				label: t('action.send_msg', 'Send e-mail'),
				disabled: isEmpty(contact?.email)
			}
		: undefined;
}

export const useContextActions = (folderId) => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();
	const tags = useTags();
	const exportAction = useActionExportContact();
	const moveAction = useActionMoveContacts();
	const restoreAction = useActionRestoreContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return (contact) => [
			...(restoreAction.canExecute({ contacts: [contact] })
				? [generateClickableAction(restoreAction, { contacts: [contact] })]
				: []),
			...(deleteAction.canExecute([contact])
				? [generateClickableAction(deleteAction, [contact])]
				: []),
			...(exportAction.canExecute() ? [generateClickableAction(exportAction, contact)] : []),
			applyTag({ contact, tags, t, createModal, closeModal })
		];
	}
	return (contact) =>
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

export const useHoverActions = (folderId) => {
	const [t] = useTranslation();
	const moveAction = useActionMoveContacts();
	const restoreAction = useActionRestoreContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return (contact) => [
			...(restoreAction.canExecute({ contacts: [contact] })
				? [generateClickableAction(restoreAction, { contacts: [contact] })]
				: []),
			...(deleteAction.canExecute([contact])
				? [generateClickableAction(deleteAction, [contact])]
				: [])
		];
	}
	return (contact) =>
		compact([
			...(trashAction.canExecute([contact])
				? [generateClickableAction(trashAction, [contact])]
				: []),
			mailToContact(contact, t),
			...(moveAction.canExecute({ contacts: [contact] })
				? [generateClickableAction(moveAction, { contacts: [contact] })]
				: [])
		]);
};

export const useSecondaryActions = ({ folderId, deselectAll, selectedContacts, ids }) => {
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
				contacts: selectedContacts,
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
			contacts: selectedContacts,
			deselectAll,
			folderId
		})
	];
};
