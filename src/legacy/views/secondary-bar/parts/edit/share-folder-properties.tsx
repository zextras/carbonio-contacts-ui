/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	ButtonOld as Button,
	Chip,
	Container,
	Padding,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { soapFetch, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Context } from './edit-context';
import { Grant } from '../../../../../carbonio-ui-commons/types/folder';
import { useAppDispatch } from '../../../../hooks/redux';
import { sendShareNotification } from '../../../../store/actions/send-share-notification';
import {
	ActionProps,
	GranteeInfoProps,
	GranteeProps,
	ShareFolderPropertiesProps
} from '../../../../types/contact';
import { GetFolderActionRequest, GetFolderActionResponse } from '../../../../types/soap';
import { ShareFolderRoleOptions, findLabel } from '../../commons/utils';

const HoverChip = styled(Chip)<{ hovered?: boolean }>`
	background-color: ${({ theme, hovered }): string =>
		hovered ? theme.palette.gray3.hover : theme.palette.gray3.regular};
`;

export const GranteeInfo = ({
	grant,
	shareFolderRoleOptions,
	hovered
}: GranteeInfoProps): React.JSX.Element => {
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
				<HoverChip label={label} hovered={hovered} />
			</Text>
		</Container>
	);
};

const Actions = ({
	folder,
	grant,
	setActiveModal,
	onMouseLeave,
	onMouseEnter
}: ActionProps): React.JSX.Element => {
	const [t] = useTranslation();
	const accounts = useUserAccounts();
	const createSnackbar = useSnackbar();
	const { setActiveGrant } = useContext(Context);
	const dispatch = useAppDispatch();
	const onRevoke = useCallback(() => {
		setActiveGrant?.(grant);
		setActiveModal('revoke');
	}, [setActiveModal, setActiveGrant, grant]);

	const onResend = useCallback(() => {
		dispatch(
			sendShareNotification({
				standardMessage: '',
				contacts: [{ email: grant.d }],
				folder,
				accounts
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `resend-${folder.id}`,
					replace: true,
					type: 'info',
					label: t('snackbar.share_resend', 'Share invite resent'),
					autoHideTimeout: 2000,
					hideButton: true
				});
			}
		});
	}, [accounts, dispatch, folder, t, grant.d, createSnackbar]);
	const onEdit = useCallback(() => {
		setActiveGrant?.(grant);
		setActiveModal('edit');
	}, [setActiveModal, setActiveGrant, grant]);

	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-end"
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			maxWidth="fit"
		>
			<Tooltip label={t('label.edit_access', 'Edit access')} placement="top">
				<Button type="outlined" label={t('label.edit')} onClick={onEdit} isSmall />
			</Tooltip>
			<Padding horizontal="extrasmall" />
			<Tooltip label={t('tooltip.revoke', 'Revoke access')} placement="top">
				<Button
					type="outlined"
					label={t('label.revoke', 'Revoke')}
					color="error"
					onClick={onRevoke}
					isSmall
				/>
			</Tooltip>
			<Padding horizontal="extrasmall" />
			<Tooltip
				label={t('tooltip.resend', 'Send e-mail notification about this share')}
				placement="top"
				maxWidth="18.75rem"
			>
				<Button type="outlined" label={t('label.resend', 'Resend')} onClick={onResend} isSmall />
			</Tooltip>
		</Container>
	);
};

const Grantee = ({
	grant,
	folder,
	setActiveModal,
	shareFolderRoleOptions
}: GranteeProps): React.JSX.Element => {
	const [hovered, setHovered] = useState(false);
	const onMouseEnter = useCallback(() => {
		setHovered(true);
	}, []);
	const onMouseLeave = useCallback(() => {
		setHovered(false);
	}, []);
	return (
		<Container orientation="horizontal" mainAlignment="flex-end" padding={{ bottom: 'small' }}>
			<GranteeInfo
				grant={grant}
				shareFolderRoleOptions={shareFolderRoleOptions}
				hovered={hovered}
			/>
			<Actions
				folder={folder}
				onMouseLeave={onMouseLeave}
				onMouseEnter={onMouseEnter}
				grant={grant}
				setActiveModal={setActiveModal}
			/>
		</Container>
	);
};

export const ShareFolderProperties = ({
	folder,
	setActiveModal
}: ShareFolderPropertiesProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [grant, setGrant] = useState<Array<Grant> | undefined>();
	const shareFolderRoleOptions = useMemo(
		() => ShareFolderRoleOptions(t, grant?.[0]?.perm?.includes('p')),
		[t, grant]
	);

	useEffect(() => {
		soapFetch<GetFolderActionRequest, GetFolderActionResponse>('GetFolder', {
			_jsns: 'urn:zimbraMail',
			folder: { l: folder.id }
		}).then((response): void => {
			if (response && response?.folder) {
				setGrant(response.folder[0].acl.grant);
			}
		});
	}, [folder, folder.id]);
	return (
		<Container mainAlignment="center" crossAlignment="flex-start" height="fit">
			<Padding vertical="small" />
			<Text weight="bold">{t('label.shares_folder_edit', 'Sharing of this address book')}</Text>
			<Padding vertical="small" />
			{map(grant, (item) => (
				<Grantee
					key={item.zid}
					grant={item}
					folder={folder}
					setActiveModal={setActiveModal}
					shareFolderRoleOptions={shareFolderRoleOptions}
				/>
			))}

			<Padding bottom="medium" />
		</Container>
	);
};
