/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Divider, useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS, getAction, replaceHistory } from '@zextras/carbonio-shell-ui';
import { head, includes, split } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import ContactPreviewContent from './contact-preview-content';
import ContactPreviewHeader from './contact-preview-header';
import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { useAppSelector } from '../../hooks/redux';
import { useDisplayName } from '../../hooks/use-display-name';
import { contactAction } from '../../store/actions/contact-action';
import { StoreProvider } from '../../store/redux';
import { selectContact } from '../../store/selectors/contacts';
import MoveModal from '../contact-actions/move-modal';

export default function ContactPreviewPanel() {
	const [t] = useTranslation();
	const urlLocation = useLocation();
	const history = useHistory();
	const { pathname } = useLocation();
	const dispatch = useDispatch();
	const { folderId, contactId } = useParams();
	const contactInternalId = contactId;
	const contact = useAppSelector((state) => selectContact(state, folderId, contactInternalId));
	const createSnackbar = useSnackbar();
	const createModal = useModal();

	const onEdit = useCallback(
		() => replaceHistory(`/folder/${folderId}/edit/${contactInternalId}`),
		[contactInternalId, folderId]
	);

	const onClose = useCallback(() => {
		includes(urlLocation?.pathname, 'search')
			? history.push(head(split(pathname, '/folder')))
			: replaceHistory(`/folder/${folderId}`);
	}, [folderId, history, pathname, urlLocation?.pathname]);

	const onDelete = useCallback(() => {
		const restoreContact = () => {
			dispatch(
				contactAction({
					contactsIDs: [contact.id],
					originID: FOLDERS.TRASH,
					destinationID: contact.parent,
					op: 'move'
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					replaceHistory(`/folder/${folderId}/contacts/${contact.id}`);
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

		dispatch(
			contactAction({
				contactsIDs: [contact.id],
				originID: contact.parent,
				destinationID: isTrash(contact.parent) ? undefined : FOLDERS.TRASH,
				op: isTrash(contact.parent) ? 'delete' : 'move'
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				onClose();
				createSnackbar({
					key: `trash`,
					replace: true,
					type: 'info',
					label: isTrash(contact.parent)
						? t('messages.snackbar.contact_deleted_permanently', 'Contact permanently deleted')
						: t('messages.snackbar.contact_moved_to_trash', 'Contact moved to trash'),
					autoHideTimeout: isTrash(contact.parent) ? 3000 : 5000,
					hideButton: isTrash(contact.parent),
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
	}, [contact, dispatch, t, createSnackbar, folderId, onClose]);

	const onPrint = useCallback(() => null, []);
	const onArchieve = useCallback(() => null, []);
	const onMail = useCallback(() => {
		const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
		if (available) {
			mailTo.onClick(contact);
		}
	}, [contact]);

	const onMove = useCallback(
		(ev) => {
			if (ev) ev.preventDefault();

			const closeModal = createModal(
				{
					children: (
						<StoreProvider>
							<MoveModal
								contact={contact}
								// open={showModal}
								onClose={() => closeModal()}
								contactId={contact.id}
								originID={contact.parent}
								folderId={folderId}
								//	setShowModal={setShowModal}
								createSnackbar={createSnackbar}
							/>
						</StoreProvider>
					)
				},
				true
			);
		},
		[contact, createModal, createSnackbar, folderId]
	);

	const displayName = useDisplayName(contact);

	if (contact && displayName) {
		return (
			<>
				<ContactPreviewHeader
					displayName={displayName}
					onClose={onClose}
					onEdit={onEdit}
					onDelete={onDelete}
					onMove={onMove}
				/>
				<ContactPreviewContent
					contact={contact}
					onEdit={onEdit}
					onDelete={onDelete}
					onPrint={onPrint}
					onArchieve={onArchieve}
					onMail={onMail}
					onMove={onMove}
				/>

				<Divider />
			</>
		);
	}
	return null;
}
