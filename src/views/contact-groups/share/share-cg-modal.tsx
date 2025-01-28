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
	ModalHeader,
	Divider,
	SelectItem
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { replace, split } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ContactInputValue } from '../../../carbonio-ui-commons/integrations/types';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { OnChangeSelect } from '../../../carbonio-ui-commons/types/select';
import { GranteeInfo } from '../../../components/modals/address-book-edit/share-folder-properties';
import {
	getRoleDescription,
	getShareFolderRoleOptions
} from '../../../components/modals/shares-utils';
import { TIMEOUTS } from '../../../constants';
import { ContactInput } from '../../../legacy/integrations/contact-input';
import { capitalise } from '../../../legacy/views/secondary-bar/utils';
import { apiClient } from '../../../network/api-client';

export type ShareCGModalProps = {
	onClose: () => void;
	contactGroupName: string;
	contactGroupId: string;
	editMode?: boolean;
	activeGrant: Grant;
};

export const ShareCGModal = ({
	onClose,
	contactGroupId,
	contactGroupName,
	editMode = false,
	activeGrant
}: ShareCGModalProps): React.JSX.Element => {
	const [t] = useTranslation();

	const shareFolderRoleOptions = useMemo(() => getShareFolderRoleOptions(t), [t]);
	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState<ContactInputValue>([]);
	const [shareWithUserRole, setshareWithUserRole] = useState<string | Array<SelectItem> | null>(
		editMode ? activeGrant.perm : 'r'
	);
	const userName = useMemo(() => replace(split(activeGrant?.d, '@')?.[0], '.', ' '), [activeGrant]);
	const userNameCapitalise = useMemo(() => capitalise(userName), [userName]);
	const account = useUserAccount();
	const createSnackbar = useSnackbar();

	const title = useMemo(
		() =>
			editMode
				? `${t('label.edit_access_name', {
						name: userNameCapitalise,
						defaultValue: "Edit {{name}}'s access"
					})} `
				: `${t('label.share', 'Share')} ${contactGroupName}`,
		[editMode, t, userNameCapitalise, contactGroupName]
	);

	const onShareRoleChange = useCallback<OnChangeSelect>(
		(shareRole: string | Array<SelectItem> | null) => {
			setshareWithUserRole(shareRole);
		},
		[]
	);

	const onConfirm = useCallback(() => {
		const addresses = editMode
			? [activeGrant?.d ?? '']
			: contacts.map((contact) => contact.value.email);
		apiClient
			.shareFolder({
				addresses,
				role: shareWithUserRole as string,
				folderId: contactGroupId
			})
			.then(() => {
				createSnackbar({
					key: `share-${contactGroupId}-item-success`,
					replace: true,
					hideButton: true,
					severity: 'info',
					label: editMode
						? t('snackbar.share_updated', 'Access rights updated')
						: t('snackbar.folder_shared', 'Address book shared'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});

				sendNotification &&
					apiClient.sendShareNotification({
						accountName: account.name,
						folderId: contactGroupId,
						addresses,
						message: standardMessage
					});

				onClose();
			})
			.catch((err) => {
				// const message = err ?? t('label.error_try_again', 'Something went wrong, please try again');
				createSnackbar({
					key: `share-${contactGroupId}-item-error`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});
			});
	}, [
		account.name,
		activeGrant?.d,
		contactGroupId,
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

	const selectedRole = useMemo(() => {
		const value = editMode ? activeGrant?.perm : 'r';
		const label = getRoleDescription(editMode ? activeGrant?.perm : 'r', t);
		return {
			value,
			label
		};
	}, [activeGrant?.perm, editMode, t]);

	return (
		<Container
			padding={{ all: 'medium' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader title={title} onClose={onClose} showCloseIcon />
			<Divider />
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
						onChange={(chips): void => {
							setContacts(chips);
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
					defaultSelection={selectedRole}
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
					onClick={(): void => setSendNotification(!sendNotification)}
					label={t('share.send_notification', 'Send notification about this share')}
				/>
			</Container>

			<Container height="fit">
				<Input
					label={t('share.standard_message', 'Add a note to standard message')}
					value={standardMessage}
					onChange={(ev): void => {
						setStandardMessage(ev.target.value);
					}}
					disabled={!sendNotification}
					background="gray5"
				/>
			</Container>
			<Container
				orientation="horizontal"
				crossAlignment="baseline"
				mainAlignment="flex-start"
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
			<Divider />
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
