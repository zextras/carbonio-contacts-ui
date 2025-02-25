/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, useState } from 'react';

import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';

import { EmptyFieldMessages, EmptyListMessages } from './utils';
import ContactEditPanel from '../edit/contact-edit-panel';
import ContactPreviewPanel from '../preview/contact-preview-panel';

const generateRandomNumber = () => Math.floor(Math.random() * 3);
const SearchPanel = ({ searchResults, query, width }) => {
	const [t] = useTranslation();
	const emptyListMessages = useMemo(() => EmptyListMessages(t), [t]);
	const emptyFieldMessages = useMemo(() => EmptyFieldMessages(t), [t]);
	const [randomIndex, setRandomIndex] = useState(0);
	useEffect(() => {
		const random = generateRandomNumber();
		setRandomIndex(random);
	}, [searchResults?.contacts.length, query]);
	const displayerMessage = useMemo(() => {
		if (searchResults?.contacts.length === 0) {
			return emptyListMessages[randomIndex];
		}
		return emptyFieldMessages[0];
	}, [randomIndex, emptyListMessages, emptyFieldMessages, searchResults?.contacts.length]);
	const displayerTitle = useMemo(() => displayerMessage?.title, [displayerMessage?.title]);
	const displayerDescription = useMemo(
		() => displayerMessage?.description,
		[displayerMessage?.description]
	);
	return (
		<Routes>
			<Route path={`/folder/:folderId/contacts/:contactId`} element={<ContactPreviewPanel />} />
			<Route path={`/folder/:folderId/edit/:editId`} element={<ContactEditPanel />} />
			<Route
				path={'/'}
				render={() => (
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
				)}
			/>
		</Routes>
	);
};

export default SearchPanel;
