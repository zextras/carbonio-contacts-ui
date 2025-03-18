/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { SearchResults } from './types';
import { EmptyFieldMessages, EmptyListMessages } from './utils';

export const SearchContactsEmptyPanel = ({
	searchResults
}: {
	searchResults: SearchResults;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const emptyListMessages = useMemo(() => EmptyListMessages(t), [t]);
	const emptyFieldMessages = useMemo(() => EmptyFieldMessages(t), [t]);

	const displayerMessage = useMemo(() => {
		if (searchResults?.contacts.length === 0) {
			return emptyListMessages[0];
		}
		return emptyFieldMessages[0];
	}, [emptyListMessages, emptyFieldMessages, searchResults?.contacts.length]);
	const displayerTitle = useMemo(() => displayerMessage?.title, [displayerMessage?.title]);
	const displayerDescription = useMemo(
		() => displayerMessage?.description,
		[displayerMessage?.description]
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
					{displayerTitle}
				</Text>
			</Padding>
			<Text
				size="small"
				color="gray1"
				overflow="break-word"
				style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
			>
				{displayerDescription}
			</Text>
		</Container>
	);
};
