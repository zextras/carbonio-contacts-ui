/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	Divider,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { TIMEOUTS } from '../../constants';
import { Contact } from '../../legacy/types/contact';
import { apiClient } from '../../network/api-client';

export type ContactDeleteModalProps = {
	contacts: Array<Contact>;
	onClose: () => void;
};

export const ContactsDeleteModal = ({
	contacts,
	onClose
}: ContactDeleteModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const modalTitle = useMemo(
		() =>
			t('messages.modal.delete.sure_delete_contact', {
				count: contacts.length,
				defaultValue_one: 'Are you sure to permanently delete this contact?',
				defaultValue_other: 'Are you sure to permanently delete the selected contacts?'
			}),
		[contacts.length, t]
	);

	const confirmButtonLabel = useMemo(
		() => t('action.delete_permanently', 'Delete Permanently'),
		[t]
	);

	const confirmationText = useMemo(
		() =>
			t(
				'messages.modal.delete.if_delete_lost_forever',
				'By permanently deleting this contact you will not be able to recover it anymore, continue?'
			),
		[t]
	);

	const onConfirm = useCallback(() => {
		const contactsIds = contacts.map((cont) => cont.id);
		apiClient
			.deleteContact(contactsIds)
			.then(() => {
				createSnackbar({
					key: `delete-contacts-success`,
					replace: true,
					type: 'info',
					label: t('messages.snackbar.contact_deleted_permanently', 'Contact permanently deleted'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
				onClose();
			})
			.catch(() =>
				createSnackbar({
					key: `delete-contacts-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				})
			);
	}, [contacts, createSnackbar, onClose, t]);

	return (
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<Divider />
			<ModalBody>
				<Text overflow="break-word">{confirmationText}</Text>
			</ModalBody>
			<Divider />
			<ModalFooter onConfirm={onConfirm} confirmLabel={confirmButtonLabel} confirmColor={'error'} />
		</>
	);
};
