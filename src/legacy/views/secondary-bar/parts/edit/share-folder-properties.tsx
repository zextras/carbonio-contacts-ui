/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	ButtonOld as Button,
	Chip,
	ChipProps,
	Container,
	Padding,
	SnackbarManagerContext,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { Grant, soapFetch, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Context } from './edit-context';
import { useAppDispatch } from '../../../../hooks/redux';
import { sendShareNotification } from '../../../../store/actions/send-share-notification';
import {
	ActionProps,
	GranteeInfoProps,
	GranteeProps,
	ShareFolderPropertiesProps
} from '../../../../types/contact';
import { ShareFolderRoleOptions, findLabel } from '../../commons/utils';

const HoverChip = styled(Chip)<ChipProps & { hovered?: boolean }>`
	background-color: ${({ theme, hovered }): string =>
		hovered ? theme.palette.gray3.hover : theme.palette.gray3.regular};
`;

export const GranteeInfo: FC<GranteeInfoProps> = ({ grant, shareFolderRoleOptions, hovered }) => {
	const role = useMemo(
		() => findLabel(shareFolderRoleOptions, grant.perm || ''),
		[shareFolderRoleOptions, grant.perm]
	);

	const label = useMemo(() => {
		const composeLabel = (name: string): string => `${name} - ${role}`;
		return grant.d ? composeLabel(grant.d) : composeLabel(grant?.zid);
	}, [grant, role]);

	return (
		<Container crossAlignment="flex-start">
			<Text>
				<HoverChip label={label} hovered={hovered} />
			</Text>
		</Container>
	);
};

const Actions: FC<ActionProps> = ({
	folder,
	grant,
	setActiveModal,
	onMouseLeave,
	onMouseEnter
}) => {
	const [t] = useTranslation();
	const accounts = useUserAccounts();
	const createSnackbar = useContext(SnackbarManagerContext);
	const { setActiveGrant } = useContext(Context);
	const dispatch = useAppDispatch();
	const onRevoke = useCallback(() => {
		setActiveGrant && setActiveGrant(grant);
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
				createSnackbar &&
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
		setActiveGrant && setActiveGrant(grant);
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

const Grantee: FC<GranteeProps> = ({ grant, folder, setActiveModal, shareFolderRoleOptions }) => {
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

export const ShareFolderProperties: FC<ShareFolderPropertiesProps> = ({
	folder,
	setActiveModal
}) => {
	const [t] = useTranslation();
	const [grant, setGrant] = useState<Array<Grant> | undefined>();
	const shareFolderRoleOptions = useMemo(
		() => ShareFolderRoleOptions(t, grant?.[0]?.perm?.includes('p')),
		[t, grant]
	);
	useEffect(() => {
		soapFetch('GetFolder', {
			_jsns: 'urn:zimbraMail',
			folder: { l: folder.id }
		}).then((res: any): void => {
			if (res?.folder) {
				setGrant(res.folder[0].acl.grant);
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
