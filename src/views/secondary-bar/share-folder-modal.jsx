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
	ChipInput,
	Padding
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { map, replace, split } from 'lodash';

import { shareFolder } from '../../store/actions/share-folder';
import { sendShareNotification } from '../../store/actions/send-share-notification';
import ModalFooter from './commons/modal-footer';

import { ModalHeader } from './commons/modal-header';
import { capitalise } from './utils';
import { findLabel, ShareFolderRoleOptions, ShareFolderWithOptions } from './commons/utils';
import { GranteeInfo } from './parts/edit/share-folder-properties';

const ShareFolderModal = ({
	goBack,
	setModal,
	dispatch,
	t,
	createSnackbar,
	folder,
	editMode = false,
	activeGrant
}) => {
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const shareFolderWithOptions = useMemo(() => ShareFolderWithOptions(t), [t]);
	const shareFolderRoleOptions = useMemo(() => ShareFolderRoleOptions(t), [t]);
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState([]);
	const [shareWithUserType, setshareWithUserType] = useState('usr');
	const [shareWithUserRole, setshareWithUserRole] = useState(editMode ? activeGrant.perm : 'r');
	const userName = useMemo(() => replace(split(activeGrant?.d, '@')?.[0], '.', ' '), [activeGrant]);
	const userNameCapitalise = useMemo(() => capitalise(userName), [userName]);

	const accounts = useUserAccounts();
	const onClose = useCallback(() => {
		setModal('');
	}, [setModal]);

	const title = useMemo(
		() =>
			editMode
				? `${t('label.edit_access_name', {
						name: userNameCapitalise,
						defaultValue: "Edit {{name}}'s access"
				  })} `
				: `${t('label.share', 'Share')} ${folder?.label}`,
		[t, folder, editMode, userNameCapitalise]
	);

	const onShareWithChange = useCallback((shareWith) => {
		setshareWithUserType(shareWith);
	}, []);

	const onShareRoleChange = useCallback((shareRole) => {
		setshareWithUserRole(shareRole);
	}, []);

	const onConfirm = useCallback(() => {
		dispatch(
			shareFolder({
				sendNotification,
				standardMessage,
				contacts: editMode ? [{ email: activeGrant.d }] : contacts,
				shareWithUserType,
				shareWithUserRole,
				folder,
				accounts
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				if (res.payload?.response?.Body?.BatchResponse?.Fault) {
					createSnackbar({
						key: `share-${folder.id}`,
						replace: true,
						hideButton: true,
						type: 'warning',
						label: res.payload?.response?.Body?.BatchResponse?.Fault?.[0]?.Reason?.Text,
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `share-${folder.id}`,
						replace: true,
						hideButton: true,
						type: 'info',
						label: editMode
							? t('snackbar.share_updated', 'Access rights updated')
							: t('snackbar.folder_shared', 'Address book shared'),
						autoHideTimeout: 3000
					});
					sendNotification &&
						dispatch(
							sendShareNotification({
								sendNotification,
								standardMessage,
								contacts: editMode ? [{ email: activeGrant.d }] : contacts,
								shareWithUserType,
								shareWithUserRole,
								folder,
								accounts
							})
						).then((res2) => {
							if (!res2.type.includes('fulfilled')) {
								createSnackbar({
									key: `share-${folder.id}`,
									replace: true,
									type: 'error',
									hideButton: true,
									label: t('label.error_try_again', 'Something went wrong, please try again'),
									autoHideTimeout: 3000
								});
							}
						});
				}
			}
		});
		setModal('');
	}, [
		setModal,
		dispatch,
		accounts,
		activeGrant,
		contacts,
		createSnackbar,
		shareWithUserRole,
		shareWithUserType,
		standardMessage,
		t,
		editMode,
		folder,
		sendNotification
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
			<ModalHeader title={title} onClose={onClose} />
			<Padding top="small" />
			{!editMode && (
				<Container height="fit">
					<Select
						items={shareFolderWithOptions}
						background="gray5"
						label={t('label.share_with', 'Share with')}
						onChange={onShareWithChange}
						defaultSelection={{
							value: 'usr',
							label: findLabel(shareFolderWithOptions, 'usr')
						}}
					/>
				</Container>
			)}
			{editMode ? (
				<Container
					orientation="horizontal"
					mainAlignment="flex-end"
					padding={{ bottom: 'large', top: 'large' }}
				>
					<GranteeInfo grant={activeGrant} shareFolderRoleOptions={shareFolderRoleOptions} />
				</Container>
			) : (
				<Container height="fit" padding={{ vertical: 'small' }}>
					{integrationAvailable ? (
						<ContactInput
							placeholder={t('share.recipients_address', 'Recipients’ e-mail addresses')}
							onChange={(ev) => {
								setContacts(ev);
							}}
							defaultValue={contacts}
						/>
					) : (
						<ChipInput
							backgroundColor="gray5"
							placeholder={t('share.recipients_address', 'Recipients’ e-mail addresses')}
							onChange={(ev) => {
								setContacts(map(ev, (contact) => ({ email: contact.address })));
							}}
							valueKey="address"
							getChipLabel={(participant) =>
								participant.fullName ?? participant.name ?? participant.address
							}
						/>
					)}
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
				label={
					editMode
						? t('label.edit_access', 'Edit access')
						: t('action.share_folder', 'Share folder')
				}
				onConfirm={onConfirm}
				disabled={editMode ? disableEdit : contacts.length < 1}
				secondaryAction={goBack}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
			/>
		</Container>
	);
};

export default ShareFolderModal;
