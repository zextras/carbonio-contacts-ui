/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Button, Container, Icon, Row, Text } from '@zextras/carbonio-design-system';

export const EmptyListPanel = ({
	emptyListTitle,
	icon,
	actionLabel,
	onAction
}: {
	emptyListTitle: string;
	icon?: string;
	actionLabel?: string;
	onAction?: () => void;
}): React.JSX.Element => (
	<Container data-testid="ContactsListToScrollContainer" crossAlignment="unset">
		{icon && (
			<Row width="fill" padding={{ top: 'extralarge', bottom: 'small' }}>
				<Icon icon={icon} size="large" color="gray1" />
			</Row>
		)}
		<Text
			color="gray1"
			overflow="break-word"
			size="small"
			style={{ whiteSpace: 'pre-line', textAlign: 'center', paddingTop: icon ? 0 : '2rem' }}
		>
			{emptyListTitle}
		</Text>
		{actionLabel && onAction && (
			<Row width="fill" padding={{ top: 'medium' }}>
				<Button
					type="ghost"
					color="primary"
					label={actionLabel}
					onClick={onAction}
					data-testid="clear-all-filters-button"
				/>
			</Row>
		)}
	</Container>
);
