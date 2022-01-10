/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Padding, Text } from '@zextras/zapp-ui';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectAllContactsInFolder } from '../../store/selectors/contacts';

const generateRandomNumber = () => Math.floor(Math.random() * 4);
export default function SelectionInteractive() {
	const [t] = useTranslation();
	const { folderId } = useParams();
	const contacts = useSelector((state) => selectAllContactsInFolder(state, folderId));
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
		() => [
			{
				title: t(`displayer.title1`, 'Create a new contact by clicking the “NEW” button.'),
				description: ''
			},
			{
				title: t(`displayer.title2`, 'Share all your works with your contacts.'),
				description: t(
					`displayer.description2`,
					'Click the “NEW” button to start creating a new one.'
				)
			},
			{
				title: t(`displayer.title3`, 'Stay in touch with your colleagues.'),
				description: t(
					`displayer.description3`,
					'Click the “NEW” button to create a new group of contacts.'
				)
			},
			{
				title: t(`displayer.title4`, 'Customize your contacts by adding personal notes'),
				description: t(`displayer.description4`, 'Create a new one by clicking the “NEW” button.')
			}
		],
		[t]
	);
	const emptyFieldMessage = useMemo(
		() => [
			{
				title: t(`displayer.title5`, 'Select a contact'),
				description: t(
					`displayer.description5`,
					'Discover all the ways you can connect with other users.'
				)
			},
			{
				title: t(`displayer.title6`, 'Customize a contact'),
				description: t(
					`displayer.description6`,
					'Use the “Edit” mode to add any personal note to a contact.'
				)
			},
			{
				title: t(`displayer.title7`, 'Stay in touch with your colleagues'),
				description: t(
					`displayer.description7`,
					'Create a group of contacts by clicking the “NEW” button.'
				)
			},
			{
				title: t(`displayer.title8`, 'Sharing is caring'),
				description: t(
					`displayer.description8`,
					'Select a contact or a group of contacts to send shared emails.'
				)
			}
		],
		[t]
	);
	const [randomIndex, setRandomIndex] = useState(0);
	useEffect(() => {
		const random = generateRandomNumber();
		setRandomIndex(random);
	}, [folderId]);

	const displayerMessage = useMemo(() => {
		if (folderId === '3') {
			return contacts?.length > 0 ? trashMessages[1] : trashMessages[0];
		}
		return contacts && contacts.length > 0
			? emptyListMessage[randomIndex]
			: emptyFieldMessage[randomIndex];
	}, [contacts, emptyListMessage, emptyFieldMessage, randomIndex, folderId, trashMessages]);
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
