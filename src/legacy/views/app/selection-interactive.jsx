/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '../../hooks/redux';
import { selectAllContactsInFolder } from '../../store/selectors/contacts';

const generateRandomNumber = () => Math.floor(Math.random() * 4);
export default function SelectionInteractive() {
	const [t] = useTranslation();
	const { folderId } = useParams();
	const contacts = useAppSelector((state) => selectAllContactsInFolder(state, folderId));
	const trashMessages = useMemo(
		() => [
			{
				title: t(`displayer.title9`, 'Click the trash icon to delete a contact.'),
				description: ''
			},
			{
				title: t(`displayer.title10`, 'Select and restore contacts from the trash'),
				description: ''
			}
		],
		[t]
	);
	const emptyListMessage = useMemo(
		() => ({
			title: t(`displayer.title1`, 'Create a new contact by clicking the “NEW” button.'),
			description: ''
		}),
		[t]
	);
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

	const displayerMessage = useMemo(() => {
		if (folderId === '3') {
			return contacts?.length > 0 ? trashMessages[1] : trashMessages[0];
		}
		return contacts?.length > 0 ? emptyListMessage : emptyFieldMessage;
	}, [contacts, emptyListMessage, emptyFieldMessage, folderId, trashMessages]);
	const displayerTitle = displayerMessage ? displayerMessage.title : '';
	const displayerDescription = displayerMessage ? displayerMessage.description : '';
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
}
