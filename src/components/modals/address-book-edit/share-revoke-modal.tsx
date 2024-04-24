/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import {
	Checkbox,
	Container,
	Input,
	ModalFooter,
	ModalHeader,
	Row,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { GranteeInfo } from './share-folder-properties';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';

export type ShareRevokeModalProps = {
	addressBookId: string;
	grant: Grant;
	onClose: () => void;
};

export const ShareRevokeModal = ({
	addressBookId,
	onClose,
	grant
}: ShareRevokeModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const createSnackbar = useSnackbar();

	const account = useUserAccount();
	const addressBook = useFolder(addressBookId);

	const onConfirm = useCallback(() => {
		apiClient
			.revokeFolderGrant(addressBookId, grant.zid ?? '')
			.then(() => {
				sendNotification &&
					apiClient.sendShareNotification({
						message: standardMessage,
						addresses: [grant.d ?? ''],
						folderId: addressBookId,
						account: account.name
					});
			})
			.then(() => {
				createSnackbar({
					key: `remove-share-${addressBookId}-grant-success`,
					replace: true,
					type: 'info',
					label: t('snackbar.share_revoke', 'Share access revoked'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
				onClose();
			})
			.catch(() => {
				createSnackbar({
					key: `remove-share-${addressBookId}-grant-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [
		account.name,
		addressBookId,
		createSnackbar,
		grant.d,
		grant.zid,
		sendNotification,
		standardMessage,
		t
	]);

	// TODO refactor DS to accept actions tooltip
	// const toolTip = useMemo(() => {
	// 	if (sendNotification && standardMessage.length > 0)
	// 		return t('label.revoke_with_custom_msg', 'Revoke access sending a custom notification');
	// 	if (sendNotification)
	// 		return t('label.revoke_with_standard_msg', 'Revoke access sending a standard notification');
	// 	return t('label.revoke_without_notification', 'Revoke access without sending a notification');
	// }, [t, sendNotification, standardMessage]);

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('label.revoke_share', {
					title: addressBook?.name,
					defaultValue: "Revoke {{title}}'s share"
				})}
				onClose={onClose}
				showCloseIcon
			/>
			<Container
				orientation="horizontal"
				mainAlignment="flex-end"
				padding={{ bottom: 'large', top: 'large' }}
			>
				<GranteeInfo grant={grant} />
			</Container>
			<Checkbox
				iconSize="medium"
				value={sendNotification}
				defaultChecked={sendNotification}
				onClick={() => setSendNotification(!sendNotification)}
				label={t('share.send_notification', 'Send notification about this share')}
			/>
			<Container
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
				padding={{ bottom: 'large', top: 'large' }}
			>
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
						{t('label.note', 'Note:')}
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
			<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
				<ModalFooter
					confirmColor={'error'}
					onConfirm={onConfirm}
					onSecondaryAction={onClose}
					secondaryActionLabel={t('folder.modal.footer.go_back', 'Go back')}
					confirmLabel={t('label.revoke', 'Revoke')}
				/>
			</Container>
		</Container>
	);
};
