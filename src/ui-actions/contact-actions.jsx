/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { compact, isEmpty } from 'lodash';
import { Text } from '@zextras/carbonio-design-system';
import { getAction, FOLDERS } from '@zextras/carbonio-shell-ui';
import { FolderActionsType } from '../types/folder';
import { contactAction } from '../store/actions/contact-action';
import MoveModal from '../views/contact-actions/move-modal';
import { applyTag, applyMultiTag, createAndApplyTag } from './tag-actions';

// eslint-disable-next-line import/extensions
import ModalFooter from '../views/contact-actions/commons/modal-footer.tsx';

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
		click: (ev) => {
			if (ev) ev.preventDefault();
			const closeModal = createModal({
				title: t('messages.modal.delete.sure_delete_contact', {
					count: ids.length,
					defaultValue: 'Are you sure to permanently delete this contact?',
					defaultValue_plural: 'Are you sure to permanently delete the selected contacts?'
				}),
				customFooter: (
					<ModalFooter
						onConfirm={() => {
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
						}}
						background="error"
						label={t('action.delete_permanently', 'Delete Permanently')}
						t={t}
						divider={false}
						verticalPadding="none"
					/>
				),
				onClose: () => closeModal(),
				showCloseIcon: true,
				children: (
					<>
						<Text overflow="break-word">
							{t(
								'messages.modal.delete.if_delete_lost_forever',
								'By permanently deleting this contact you will not be able to recover it anymore, continue?'
							)}
						</Text>
					</>
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
		id: parent === FOLDERS.TRASH ? 'deletePermanently' : 'delete',
		icon: parent === FOLDERS.TRASH ? 'DeletePermanentlyOutline' : 'Trash2Outline',
		label: t('label.delete', 'Delete'),
		click: (ev) => {
			if (ev) ev.preventDefault();

			dispatch(
				contactAction({
					contactsIDs: ids,
					originID: parent,
					destinationID: parent === FOLDERS.TRASH ? undefined : FOLDERS.TRASH,
					op: parent === FOLDERS.TRASH ? FolderActionsType.DELETE : FolderActionsType.MOVE
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

export function moveContact(contact, folderId, t, dispatch, parent, createModal, createSnackbar) {
	return {
		id: contact.parent === FOLDERS.TRASH ? 'restore' : 'move',
		icon: contact.parent === FOLDERS.TRASH ? 'RestoreOutline' : 'MoveOutline',
		label:
			contact.parent === FOLDERS.TRASH ? t('label.restore', 'Restore') : t('label.move', 'Move'),
		click: (ev) => {
			if (ev) ev.preventDefault();
			const closeModal = createModal(
				{
					children: (
						<>
							<MoveModal
								contact={contact}
								onClose={() => closeModal()}
								contactId={contact.id}
								originID={contact.parent}
								folderId={folderId}
								createSnackbar={createSnackbar}
							/>
						</>
					)
				},
				true
			);
		}
	};
}

export const contextActions = ({
	folderId,
	t,
	dispatch,
	replaceHistory,
	createSnackbar,
	createModal,
	tags
}) => {
	switch (folderId) {
		case FOLDERS.TRASH:
			return (contact) => [
				moveContact(contact, folderId, t, dispatch, contact.parent, createModal, createSnackbar),
				deletePermanently({
					ids: [contact.id],
					t,
					dispatch,
					createSnackbar,
					createModal
				}),
				applyTag({ contact, tags, t, context: { createAndApplyTag, createModal } })
			];

		default:
			return (contact) =>
				compact([
					moveToTrash({
						ids: [contact.id],
						t,
						dispatch,
						parent: contact.parent,
						createSnackbar,
						replaceHistory
					}),
					mailToContact(contact, t),
					moveContact(contact, folderId, t, dispatch, contact.parent, createModal, createSnackbar),
					applyTag({ contact, tags, t, context: { createAndApplyTag, createModal } })
				]);
	}
};

export const hoverActions = ({
	folderId,
	t,
	dispatch,
	replaceHistory,
	createSnackbar,
	createModal
}) => {
	switch (folderId) {
		case FOLDERS.TRASH:
			return (contact) => [
				moveContact(contact, folderId, t, dispatch, contact.parent, createModal, createSnackbar),
				deletePermanently({
					ids: [contact.id],
					t,
					dispatch,
					createSnackbar,
					createModal
				})
			];

		default:
			return (contact) =>
				compact([
					moveToTrash({
						ids: [contact.id],
						t,
						dispatch,
						parent: contact.parent,
						createSnackbar,
						replaceHistory
					}),
					mailToContact(contact, t),
					moveContact(contact, folderId, t, dispatch, contact.parent, createModal, createSnackbar)
				]);
	}
};

export const primaryActions = ({ folderId }) => {
	switch (folderId) {
		case FOLDERS.TRASH:
			return () => [];

		default:
			return () => [];
	}
};
export const secondaryActions = ({
	folderId,
	t,
	dispatch,
	replaceHistory,
	createSnackbar,
	createModal,
	selectedIds,
	deselectAll,
	tags,
	selectedContacts,
	ids
}) => {
	switch (folderId) {
		case FOLDERS.TRASH:
			return () => [
				deletePermanently({
					ids: selectedIds,
					t,
					dispatch,
					createSnackbar,
					createModal,
					deselectAll
				}),
				applyMultiTag({
					t,
					tags,
					ids,
					contacts: selectedContacts,
					deselectAll,
					folderId
				})
			];

		default:
			return () => [
				moveToTrash({
					ids: selectedIds,
					t,
					dispatch,
					folderId,
					createSnackbar,
					deselectAll,
					replaceHistory
				}),
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
};
