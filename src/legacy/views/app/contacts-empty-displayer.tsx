/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export default function ContactsEmptyDisplayer(): React.JSX.Element {
	const [t] = useTranslation();
	const emptyFieldMessage = useMemo(
		() => ({
			title: t(`displayer.title5`, 'Select a contact'),
			description: t(
				`displayer.description5`,
				'Discover all the ways you can connect with other users.'
			)
		}),
		[t]
	);

	return (
		<Container background="gray5">
			<Padding all="medium">
				<Text
					color="gray1"
					overflow="break-word"
					weight="bold"
					size="large"
					style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
				>
					{emptyFieldMessage.title}
				</Text>
			</Padding>
			<Text
				size="small"
				color="gray1"
				overflow="break-word"
				style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
			>
				{emptyFieldMessage.description}
			</Text>
		</Container>
	);
}
