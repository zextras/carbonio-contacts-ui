/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	Button,
	Chip,
	Container,
	Padding,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';
import { getRoleDescription } from '../shares-utils';

type GranteeInfoProps = {
	grant: Grant;
};

type ActionProps = {
	addressBookId: string;
	grant: Grant;
	onEdit: (grant: Grant) => void;
	onRevoke: (grant: Grant) => void;
};

export type GranteeProps = {
	grant: Grant;
	addressBookId: string;
	onEdit: (grant: Grant) => void;
	onRevoke: (grant: Grant) => void;
};

export type ShareFolderPropertiesProps = {
	addressBookId: string;
	onEdit: (grant: Grant) => void;
	onRevoke: (grant: Grant) => void;
};

export const GranteeInfo = ({ grant }: GranteeInfoProps): React.JSX.Element => {
	const [t] = useTranslation();

	const role = useMemo(() => getRoleDescription(grant.perm || '', t), [grant.perm, t]);

	const label = useMemo(() => {
		const composeLabel = (name?: string): string => `${name} - ${role}`;
		return grant.d ? composeLabel(grant.d) : composeLabel(grant.zid);
	}, [grant, role]);

	return (
		<Container crossAlignment="flex-start">
			<Chip label={label} />
		</Container>
	);
};

const Actions = ({ addressBookId, grant, onEdit, onRevoke }: ActionProps): React.JSX.Element => {
	const [t] = useTranslation();
	const account = useUserAccount();
	const createSnackbar = useSnackbar();

	const onRevokeClick = useCallback(() => {
		onRevoke(grant);
	}, [grant, onRevoke]);

	const onResend = useCallback(() => {
		if (!grant.d) {
			return;
		}

		apiClient
			.sendShareNotification({
				accountName: account.name,
				folderId: addressBookId,
				addresses: [grant.d]
			})
			.then((res) => {
				createSnackbar({
					key: `resend-${addressBookId}-share-notification-success`,
					replace: true,
					severity: 'info',
					label: t('snackbar.share_resend', 'Share invite resent'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			})
			.catch(() => {
				createSnackbar({
					key: `resend-${addressBookId}-share-notification-error`,
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [account, addressBookId, t, grant.d, createSnackbar]);

	const onEditClick = useCallback(() => {
		onEdit(grant);
	}, [grant, onEdit]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-end" maxWidth="fit">
			<Tooltip label={t('label.edit_access', 'Edit access')} placement="top">
				<Button type="outlined" label={t('label.edit')} onClick={onEditClick} size={'small'} />
			</Tooltip>
			<Padding horizontal="extrasmall" />
			<Tooltip label={t('tooltip.revoke', 'Revoke access')} placement="top">
				<Button
					type="outlined"
					label={t('label.revoke', 'Revoke')}
					color="error"
					onClick={onRevokeClick}
					size={'small'}
				/>
			</Tooltip>
			<Padding horizontal="extrasmall" />
			<Tooltip
				label={t('tooltip.resend', 'Send e-mail notification about this share')}
				placement="top"
				maxWidth="18.75rem"
			>
				<Button
					type="outlined"
					label={t('label.resend', 'Resend')}
					onClick={onResend}
					size={'small'}
				/>
			</Tooltip>
		</Container>
	);
};

const Grantee = ({ grant, addressBookId, onEdit, onRevoke }: GranteeProps): React.JSX.Element => (
	<Container orientation="horizontal" mainAlignment="flex-end" padding={{ bottom: 'small' }}>
		<GranteeInfo grant={grant} />
		<Actions addressBookId={addressBookId} grant={grant} onEdit={onEdit} onRevoke={onRevoke} />
	</Container>
);

export const ShareFolderProperties = ({
	addressBookId,
	onEdit,
	onRevoke
}: ShareFolderPropertiesProps): React.JSX.Element => {
	const [t] = useTranslation();
	const addressBook = useFolder(addressBookId);

	const grants = addressBook?.acl?.grant ?? [];

	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<Padding vertical="small" />
			<Text weight="bold">{t('label.shares_folder_edit', 'Sharing of this address book')}</Text>
			<Padding vertical="small" />
			{map(grants, (grant) => (
				<Grantee
					key={grant.zid}
					grant={grant}
					addressBookId={addressBookId}
					onEdit={onEdit}
					onRevoke={onRevoke}
				/>
			))}

			<Padding bottom="medium" />
		</Container>
	);
};
