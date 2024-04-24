/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Container,
	Input,
	Select,
	Text,
	Checkbox,
	Row,
	Padding,
	useSnackbar,
	ModalFooter,
	ModalHeader
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { replace, split } from 'lodash';
import { useTranslation } from 'react-i18next';

import { GranteeInfo } from './share-folder-properties';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { ContactInput } from '../../../legacy/integrations/contact-input';
import { capitalise } from '../../../legacy/views/secondary-bar/utils';
import { apiClient } from '../../../network/api-client';
import { findLabel, getShareFolderRoleOptions } from '../shares-utils';

export type ShareFolderModalProps = {
	onClose: () => void;
	addressBookId: string;
	editMode?: boolean;
	activeGrant: Grant;
};

export const ShareFolderModal = ({
	onClose,
	addressBookId,
	editMode = false,
	activeGrant
}: ShareFolderModalProps): React.JSX.Element => {
	const [t] = useTranslation();

	const shareFolderRoleOptions = useMemo(() => getShareFolderRoleOptions(t), [t]);
	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState<Array<{ email: string }>>([]);
	const [shareWithUserRole, setshareWithUserRole] = useState(editMode ? activeGrant.perm : 'r');
	const userName = useMemo(() => replace(split(activeGrant?.d, '@')?.[0], '.', ' '), [activeGrant]);
	const userNameCapitalise = useMemo(() => capitalise(userName), [userName]);
	const account = useUserAccount();
	const addressBook = useFolder(addressBookId);
	const createSnackbar = useSnackbar();

	const title = useMemo(
		() =>
			editMode
				? `${t('label.edit_access_name', {
						name: userNameCapitalise,
						defaultValue: "Edit {{name}}'s access"
					})} `
				: `${t('label.share', 'Share')} ${addressBook?.name}`,
		[t, addressBook, editMode, userNameCapitalise]
	);

	const onShareRoleChange = useCallback((shareRole) => {
		setshareWithUserRole(shareRole);
	}, []);

	const onConfirm = useCallback(() => {
		const addresses = editMode ? [activeGrant?.d ?? ''] : contacts.map((contact) => contact.email);
		apiClient
			.shareFolder({
				addresses,
				role: shareWithUserRole,
				folderId: addressBookId
			})
			.then(() => {
				createSnackbar({
					key: `share-${addressBookId}-address-book-success`,
					replace: true,
					hideButton: true,
					type: 'info',
					label: editMode
						? t('snackbar.share_updated', 'Access rights updated')
						: t('snackbar.folder_shared', 'Address book shared'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});

				sendNotification &&
					apiClient.sendShareNotification({
						accountName: account.name,
						folderId: addressBookId,
						addresses,
						message: standardMessage
					});

				onClose();
			})
			.catch((err) => {
				// const message = err ?? t('label.error_try_again', 'Something went wrong, please try again');
				createSnackbar({
					key: `share-${addressBookId}-address-book-error`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});
			});
	}, [
		account.name,
		activeGrant?.d,
		addressBookId,
		contacts,
		createSnackbar,
		editMode,
		onClose,
		sendNotification,
		shareWithUserRole,
		standardMessage,
		t
	]);

	const disableEdit = useMemo(
		() => activeGrant?.perm === shareWithUserRole,
		[activeGrant?.perm, shareWithUserRole]
	);

	return (
		<Container
			padding={{ all: 'medium' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} showCloseIcon />
			<Padding top="small" />
			{editMode ? (
				<Container
					orientation="horizontal"
					mainAlignment="flex-end"
					padding={{ bottom: 'large', top: 'large' }}
				>
					<GranteeInfo grant={activeGrant} />
				</Container>
			) : (
				<Container height="fit" padding={{ vertical: 'small' }}>
					<ContactInput
						placeholder={t('share.recipients_address', 'Recipients’ e-mail addresses')}
						onChange={(ev) => {
							const normalizedContacts = ev.reduce<Array<{ email: string }>>((result, contact) => {
								if (contact.email) {
									result.push({ email: contact.email });
								}
								return result;
							}, []);
							setContacts(normalizedContacts);
						}}
						defaultValue={contacts}
					/>
				</Container>
			)}

			<Container height="fit">
				<Select
					items={shareFolderRoleOptions}
					background="gray5"
					label={t('share.role', 'Role')}
					onChange={onShareRoleChange}
					defaultSelection={{
						value: editMode ? activeGrant?.perm : 'r',
						label: findLabel(shareFolderRoleOptions, editMode ? activeGrant?.perm : 'r')
					}}
				/>
			</Container>
			<Container
				height="fit"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ vertical: 'medium' }}
			>
				<Checkbox
					value={sendNotification}
					defaultChecked={sendNotification}
					onClick={() => setSendNotification(!sendNotification)}
					label={t('share.send_notification', 'Send notification about this share')}
				/>
			</Container>

			<Container height="fit">
				<Input
					label={t('share.standard_message', 'Add a note to standard message')}
					value={standardMessage}
					onChange={(ev) => {
						setStandardMessage(ev.target.value);
					}}
					disabled={!sendNotification}
					backgroundColor="gray5"
				/>
			</Container>
			<Container
				orientation="horizontal"
				crossAlignment="baseline"
				mainAlignment="baseline"
				padding={{ all: 'small' }}
			>
				<Row padding={{ right: 'small' }}>
					<Text weight="bold" size="small" color="gray0">
						Note:
					</Text>
				</Row>
				<Row padding={{ bottom: 'small' }}>
					<Text overflow="break-word" size="small" color="gray1">
						{t(
							'share.share_note',
							'The standard message displays your name, the name of the shared item, permissions granted to the recipients, and sign in information.'
						)}
					</Text>
				</Row>
			</Container>
			<ModalFooter
				confirmLabel={
					editMode
						? t('label.edit_access', 'Edit access')
						: t('action.share_folder', 'Share folder')
				}
				onConfirm={onConfirm}
				confirmDisabled={editMode ? disableEdit : contacts.length < 1}
				onSecondaryAction={onClose}
				secondaryActionLabel={t('folder.modal.footer.go_back', 'Go back')}
			/>
		</Container>
	);
};
