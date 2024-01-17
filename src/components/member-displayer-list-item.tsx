/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Avatar, Button, Row, TextWithTooltip } from '@zextras/carbonio-design-system';

import { useActionCopyToClipboard } from '../actions/copy-to-clipboard';
import { useActionSendEmail } from '../actions/send-email';

export type MemberDisplayerListItemComponentProps = {
	email: string;
};

export const MemberDisplayerListItemComponent = ({
	email
}: MemberDisplayerListItemComponentProps): React.JSX.Element => {
	const sendEmailAction = useActionSendEmail();
	const copyToClipboardAction = useActionCopyToClipboard();

	const onSendEmail = useCallback(() => {
		sendEmailAction.execute([email]);
	}, [email, sendEmailAction]);

	const onCopyEmail = useCallback(() => {
		copyToClipboardAction.execute(email);
	}, [copyToClipboardAction, email]);

	const canSendEmail = useMemo(() => sendEmailAction.canExecute(), [sendEmailAction]);

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
			<Row wrap={'nowrap'} gap={'0.25rem'} flexShrink={1} minWidth={'fit-content'}>
				{canSendEmail && (
					<Button
						type={'outlined'}
						size={'medium'}
						icon={sendEmailAction.icon}
						onClick={onSendEmail}
						minWidth={'fit-content'}
					/>
				)}
				<Button
					type={'outlined'}
					size={'medium'}
					icon={copyToClipboardAction.icon}
					onClick={onCopyEmail}
					minWidth={'fit-content'}
				/>
			</Row>
		</Row>
	);
};
