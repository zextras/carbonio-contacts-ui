/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Avatar, Button, Row, TextWithTooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export type MemberListItemComponentProps = {
	email: string;
	onRemove: () => void;
};

export const MemberListItemComponent: FC<MemberListItemComponentProps> = ({ email, onRemove }) => {
	const [t] = useTranslation();
	const onRemoveClick = useCallback(() => onRemove(), [onRemove]);
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
			<Button
				type={'outlined'}
				label={t('members_list_item_component.button.remove', 'remove')}
				icon={'Trash2Outline'}
				color={'error'}
				onClick={onRemoveClick}
				minWidth={'fit-content'}
			/>
		</Row>
	);
};
