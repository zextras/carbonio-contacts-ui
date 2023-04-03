/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox, Container, Input, Row, Text } from '@zextras/carbonio-design-system';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { folderAction } from '../../../../store/actions/folder-action';
import { sendShareNotification } from '../../../../store/actions/send-share-notification';
import { useAppDispatch } from '../../../../store/redux';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { ShareFolderRoleOptions } from '../../commons/utils';
import { GranteeInfo } from './share-folder-properties';

const ShareRevokeModal = ({ folder, onClose, grant, createSnackbar, goBack }) => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');

	const accounts = useUserAccounts();
	const dispatch = useAppDispatch();

	const onConfirm = useCallback(() => {
		sendNotification
			? dispatch(
					sendShareNotification({
						sendNotification,
						standardMessage,
						contacts: [{ email: grant.d }],
						folder,
						accounts
					})
			  ).then(() => {
					dispatch(folderAction({ folder, zid: grant.zid, op: '!grant' })).then((res) => {
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `remove-share-${folder.id}`,
								replace: true,
								type: 'info',
								label: t('snackbar.share_revoke', 'Share access revoked'),
								autoHideTimeout: 2000,
								hideButton: true
							});
						}
						goBack();
					});
			  })
			: dispatch(folderAction({ folder, zid: grant.zid, op: '!grant' })).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `remove-share-${folder.id}`,
							replace: true,
							type: 'info',
							label: t('snackbar.share_revoke', 'Share access revoked'),
							autoHideTimeout: 2000,
							hideButton: true
						});
					}
					goBack();
			  });
	}, [
		accounts,
		dispatch,
		grant.d,
		goBack,
		grant.zid,
		sendNotification,
		standardMessage,
		folder,
		createSnackbar,
		t
	]);
	const shareFolderRoleOptions = useMemo(
		() => ShareFolderRoleOptions(t, grant.perm?.includes('p')),
		[t, grant.perm]
	);

	const toolTip = useMemo(() => {
		if (sendNotification && standardMessage.length > 0)
			return t('label.revoke_with_custom_msg', 'Revoke access sending a custom notification');
		if (sendNotification)
			return t('label.revoke_with_standard_msg', 'Revoke access sending a standard notification');
		return t('label.revoke_without_notification', 'Revoke access without sending a notification');
	}, [t, sendNotification, standardMessage]);
	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('label.revoke_share', {
					title: folder.name,
					defaultValue: "Revoke {{title}}'s share"
				})}
				onClose={onClose}
			/>
			<Container
				orientation="horizontal"
				mainAlignment="flex-end"
				padding={{ bottom: 'large', top: 'large' }}
			>
				<GranteeInfo grant={grant} shareFolderRoleOptions={shareFolderRoleOptions} />
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
					background="error"
					onConfirm={onConfirm}
					secondaryAction={goBack}
					secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
					label={t('label.revoke', 'Revoke')}
					t={t}
					tooltip={toolTip}
				/>
			</Container>
		</Container>
	);
};
export default ShareRevokeModal;
