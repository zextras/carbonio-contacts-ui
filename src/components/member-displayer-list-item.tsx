/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Avatar, Row, TextWithTooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export type MemberDisplayerListItemComponentProps = {
	email: string;
};

export const MemberDisplayerListItemComponent = ({
	email
}: MemberDisplayerListItemComponentProps): React.JSX.Element => {
	const [t] = useTranslation();
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
		</Row>
	);
};
