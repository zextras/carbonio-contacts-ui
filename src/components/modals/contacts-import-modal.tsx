/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	Container,
	Divider,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../constants';
import { apiClient } from '../../network/api-client';

export type ContactsImportModalProps = {
	addressBook: Folder;
	closeCallback: () => void;
	file: File;
};

export const ContactsImportModal = ({
	addressBook,
	closeCallback,
	file
}: ContactsImportModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const title = useMemo(() => t('import_contacts.modal.title', 'Import contacts'), [t]);

	const confirmLabel = useMemo(() => t('import_contacts.modal.confirm', 'Import'), [t]);

	const onClose = useCallback(() => {
		closeCallback();
	}, [closeCallback]);

	const onUploadError = useCallback(
		(file: File): void => {
			createSnackbar({
				key: `contacts-import-upload-error`,
				replace: true,
				type: 'error',
				label: t('label.errors.upload_failed_generic', {
					filename: file.name,
					defaultValue: 'Upload failed for the file "{{filename}}"'
				}),
				autoHideTimeout: TIMEOUTS.defaultSnackbar
			});
		},
		[createSnackbar, t]
	);

	const onUploadComplete = useCallback(
		({ attachmentId, folderId }: { attachmentId: string; folderId: string }): void => {
			apiClient
				.importContacts({ aid: attachmentId, folderId })
				.then((response) => {
					createSnackbar({
						key: 'contacts-import-success',
						replace: true,
						type: 'info',
						hideButton: true,
						label: t('import_contacts.snackbar.import_contacts_success', {
							count: response.contactsCount,
							defaultValue: `{{count}} contacts imported and added to the selected address book`,
							defaultValue_one: `{{count}} contact imported and added to the selected address book`
						}),
						autoHideTimeout: TIMEOUTS.defaultSnackbar
					});
					onClose();
				})
				.catch(() => {
					createSnackbar({
						key: 'contacts-import-error',
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				});
		},
		[createSnackbar, onClose, t]
	);

	const onConfirm = useCallback(() => {
		apiClient
			.upload(file)
			.then((response) => {
				const fileInfo = response[0];
				onUploadComplete({ attachmentId: fileInfo.aid, folderId: addressBook.id });
			})
			.catch(() => {
				onUploadError(file);
			});
	}, [addressBook.id, file, onUploadComplete, onUploadError]);

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} showCloseIcon />
			<Divider />
			<ModalBody>
				<Text overflow="break-word" size="medium">
					{t('import_contacts.modal.description', {
						fileName: file.name,
						folderName: addressBook.name,
						defaultValue: `The contacts contained within the specified {{fileName}} file will be imported into "{{folderName}}" folder`
					})}
				</Text>
			</ModalBody>
			<Divider />
			<ModalFooter confirmLabel={confirmLabel} onConfirm={onConfirm} />
		</Container>
	);
};
