/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Divider, Row, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export type ContactsListSectionHeaderProps = {
	letter: string;
	count: number;
};

export const ContactsListSectionHeader = ({
	letter,
	count
}: ContactsListSectionHeaderProps): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<>
			<Row
				background={'gray5'}
				width="fill"
				height="2rem"
				mainAlignment="space-between"
				padding={{ horizontal: 'medium' }}
				data-testid={`contacts-list-section-${letter}`}
			>
				<Text size="medium" weight="bold">
					{letter}
				</Text>
				<Text size="extrasmall" color="secondary">
					{t('folder_panel.section.visible_contacts', {
						count,
						defaultValue_one: '{{count}} visible contact',
						defaultValue: '{{count}} visible contacts'
					})}
				</Text>
			</Row>
			<Divider />
		</>
	);
};
