/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Avatar, Button, Row, TextWithTooltip, useSnackbar } from '@zextras/carbonio-design-system';
import { useIntegratedFunction } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { copyToClipboard } from '../carbonio-ui-commons/utils/clipboard';

export type MemberDisplayerListItemComponentProps = {
	email: string;
};

export const MemberDisplayerListItemComponent = ({
	email
}: MemberDisplayerListItemComponentProps): React.JSX.Element => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const [openMailComposer, isComposePrefillMessageAvailable] =
		useIntegratedFunction('composePrefillMessage');

	const onSendEmail = useCallback(() => {
		openMailComposer({ recipients: [{ email }] });
	}, [email, openMailComposer]);

	const onCopyEmail = useCallback(() => {
		copyToClipboard(email).then(() => {
			createSnackbar({
				key: `clipboard-copy-success`,
				replace: true,
				type: 'success',
				hideButton: true,
				label: t(
					'member_displayer_list_item_component.snackbar.email_copied_to_clipboard',
					'Email copied to clipboard.'
				)
			});
		});
	}, [createSnackbar, email, t]);

	return (
		<Row
			width={'fill'}
			mainAlignment={'space-between'}
			padding={'small'}
			gap={'0.5rem'}
			data-testid={'member-list-item'}
			wrap={'nowrap'}
		>
			<Row wrap={'nowrap'} gap={'0.5rem'} flexShrink={1} minWidth={'1rem'}>
				<Avatar size={'medium'} label={email} />
				<Row flexShrink={1} minWidth={'1rem'}>
					<TextWithTooltip size={'small'}>{email}</TextWithTooltip>
				</Row>
			</Row>
			<Row wrap={'nowrap'} gap={'0.5rem'}>
				{isComposePrefillMessageAvailable && (
					<Button
						type={'outlined'}
						size={'medium'}
						icon={'EmailOutline'}
						onClick={onSendEmail}
						minWidth={'fit-content'}
					/>
				)}
				<Button
					type={'outlined'}
					size={'medium'}
					icon={'Copy'}
					onClick={onCopyEmail}
					minWidth={'fit-content'}
				/>
			</Row>
		</Row>
	);
};
