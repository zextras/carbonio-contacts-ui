/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Text, useModal } from '@zextras/carbonio-design-system';
import { getAction, FOLDERS, useTags } from '@zextras/carbonio-shell-ui';
import { compact, isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { applyTag, applyMultiTag, createAndApplyTag } from './tag-actions';
import { useActionDeleteContacts } from '../../actions/delete-contacts';
import { useActionExportContact } from '../../actions/export-contact';
import { useActionMoveContacts } from '../../actions/move-contacts';
import { useActionRestoreContacts } from '../../actions/restore-contacts';
import { useActionTrashContacts } from '../../actions/trash-contacts';
import { getFolderIdParts, isTrash } from '../../carbonio-ui-commons/helpers/folders';
import { contactAction } from '../store/actions/contact-action';
import { StoreProvider } from '../store/redux';
import { FolderActionsType } from '../types/folder';

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
				label: t('action.send_msg', 'Send e-mail'),
				disabled: isEmpty(contact?.email)
			}
		: undefined;
}
export function deletePermanently({ ids, t, dispatch, createSnackbar, createModal, deselectAll }) {
	return {
		id: 'deletePermanently',
		icon: 'DeletePermanentlyOutline',
		label: t('action.delete_permanently', 'Delete Permanently'),
		onClick: (ev) => {
			if (ev) ev.preventDefault();
			const closeModal = createModal({
				title: t('messages.modal.delete.sure_delete_contact', {
					count: ids.length,
					defaultValue_one: 'Are you sure to permanently delete this contact?',
					defaultValue_other: 'Are you sure to permanently delete the selected contacts?'
				}),
				confirmLabel: t('action.delete_permanently', 'Delete Permanently'),
				confirmColor: 'error',
				onConfirm: () => {
					closeModal();
					dispatch(
						contactAction({
							contactsIDs: ids,
							originID: FOLDERS.TRASH,
							destinationID: undefined,
							op: FolderActionsType.DELETE
						})
					).then((res) => {
						deselectAll && deselectAll();
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `edit`,
								replace: true,
								type: 'success',
								label: t(
									'messages.snackbar.contact_deleted_permanently',
									'Contact permanently deleted'
								),
								autoHideTimeout: 3000,
								hideButton: true
							});
						} else {
							createSnackbar({
								key: `edit`,
								replace: true,
								type: 'error',
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000
							});
						}
					});
				},
				onClose: () => closeModal(),
				showCloseIcon: true,
				children: (
					<StoreProvider>
						<Text overflow="break-word">
							{t(
								'messages.modal.delete.if_delete_lost_forever',
								'By permanently deleting this contact you will not be able to recover it anymore, continue?'
							)}
						</Text>
					</StoreProvider>
				)
			});
		}
	};
}
export function moveToTrash({ ids, t, dispatch, parent, createSnackbar, deselectAll }) {
	const restoreContact = () => {
		dispatch(
			contactAction({
				contactsIDs: ids,
				originID: FOLDERS.TRASH,
				destinationID: parent,
				op: FolderActionsType.MOVE
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `trash`,
					replace: true,
					type: 'success',
					label: t('messages.snackbar.contact_restored', 'Contact restored'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else {
				createSnackbar({
					key: `edit`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	};

	return {
		id: isTrash(parent) ? 'deletePermanently' : 'delete',
		icon: isTrash(parent) ? 'DeletePermanentlyOutline' : 'Trash2Outline',
		label: t('label.delete', 'Delete'),
		onClick: (ev) => {
			if (ev) ev.preventDefault();

			dispatch(
				contactAction({
					contactsIDs: ids,
					originID: parent,
					destinationID: isTrash(parent) ? undefined : FOLDERS.TRASH,
					op: isTrash(parent) ? FolderActionsType.DELETE : FolderActionsType.MOVE
				})
			).then((res) => {
				deselectAll && deselectAll();
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `trash`,
						replace: true,
						type: 'info',
						label: t('messages.snackbar.contact_moved_to_trash', 'Contact moved to trash'),
						autoHideTimeout: 5000,
						hideButton: false,
						actionLabel: 'Undo',
						onActionClick: () => restoreContact()
					});
				} else {
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		}
	};
}

export const useContextActions = (folderId) => {
	const [t] = useTranslation();
	const createModal = useModal();
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
			applyTag({ contact, tags, t, context: { createAndApplyTag, createModal } })
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
			applyTag({ contact, tags, t, context: { createAndApplyTag, createModal } })
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
