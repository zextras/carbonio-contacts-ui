/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useMemo } from 'react';

import {
	Button,
	Chip,
	Container,
	getColor,
	Padding,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Context } from './edit-context';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';
import { getShareFolderRoleOptions, findLabel } from '../shares-utils';

const HoverChip = styled(Chip)`
	&:hover {
		background-color: ${({ theme, background }): string => getColor(`${background}.hover`, theme)};
	}
`;

type GranteeInfoProps = {
	grant: Grant;
};

type ActionProps = {
	addressBookId: string;
	grant: Grant;
	setActiveModal: (arg: string) => void;
};

export type GranteeProps = {
	grant: Grant;
	addressBookId: string;
	setActiveModal: (modal: string) => void;
};

export type ShareFolderPropertiesProps = {
	addressBookId: string;
};

export const GranteeInfo = ({ grant }: GranteeInfoProps): React.JSX.Element => {
	const [t] = useTranslation();
	const shareFolderRoleOptions = useMemo(() => getShareFolderRoleOptions(t), [t]);

	const role = useMemo(
		() => findLabel(shareFolderRoleOptions, grant.perm || ''),
		[shareFolderRoleOptions, grant.perm]
	);

	const label = useMemo(() => {
		const composeLabel = (name?: string): string => `${name} - ${role}`;
		return grant.d ? composeLabel(grant.d) : composeLabel(grant.zid);
	}, [grant, role]);

	return (
		<Container crossAlignment="flex-start">
			<Text>
				<HoverChip label={label} />
			</Text>
		</Container>
	);
};

const Actions = ({ addressBookId, grant, setActiveModal }: ActionProps): React.JSX.Element => {
	const [t] = useTranslation();
	const account = useUserAccount();
	const createSnackbar = useSnackbar();
	const { setActiveGrant } = useContext(Context);

	const onRevoke = useCallback(() => {
		setActiveGrant?.(grant);
		setActiveModal('revoke');
	}, [setActiveModal, setActiveGrant, grant]);

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
					type: 'info',
					label: t('snackbar.share_resend', 'Share invite resent'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			})
			.catch(() => {
				createSnackbar({
					key: `resend-${addressBookId}-share-notification-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [account, addressBookId, t, grant.d, createSnackbar]);

	const onEdit = useCallback(() => {
		setActiveGrant?.(grant);
		setActiveModal('edit');
	}, [setActiveModal, setActiveGrant, grant]);

	return (
		<Container orientation="horizontal" mainAlignment="flex-end" maxWidth="fit">
			<Tooltip label={t('label.edit_access', 'Edit access')} placement="top">
				<Button type="outlined" label={t('label.edit')} onClick={onEdit} size={'small'} />
			</Tooltip>
			<Padding horizontal="extrasmall" />
			<Tooltip label={t('tooltip.revoke', 'Revoke access')} placement="top">
				<Button
					type="outlined"
					label={t('label.revoke', 'Revoke')}
					color="error"
					onClick={onRevoke}
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

const Grantee = ({ grant, addressBookId, setActiveModal }: GranteeProps): React.JSX.Element => (
	<Container orientation="horizontal" mainAlignment="flex-end" padding={{ bottom: 'small' }}>
		<GranteeInfo grant={grant} />
		<Actions addressBookId={addressBookId} grant={grant} setActiveModal={setActiveModal} />
	</Container>
);

export const ShareFolderProperties = ({
	addressBookId
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
				<Grantee key={grant.zid} grant={grant} addressBookId={addressBookId} />
			))}

			<Padding bottom="medium" />
		</Container>
	);
};
