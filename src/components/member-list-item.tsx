/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Avatar, Button, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export type MemberListItemComponentProps = {
	email: string;
	isOwner?: boolean;
	onRemove: () => void;
};

export const MemberListItemComponent: FC<MemberListItemComponentProps> = ({
	email,
	isOwner,
	onRemove
}) => {
	const [t] = useTranslation();
	const onRemoveClick = useCallback(() => onRemove(), [onRemove]);
	return (
		<Row width={'fill'}>
			<Avatar size={'small'} label={email} />
			<Text size={'small'}>{email}</Text>
			{isOwner && (
				<Text size={'small'} color={'secondary'}>
					{t('members_list_item_component.label.manager', 'Manager')}
				</Text>
			)}
			<Button
				type={'outlined'}
				label={t('members_list_item_component.button.remove', 'remove')}
				icon={'Trash2Outline'}
				onClick={onRemoveClick}
			></Button>
		</Row>
	);
};
