/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Container,
	Button,
	Text,
	Input,
	InputProps,
	Avatar
} from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { noop, size } from 'lodash';
import { useTranslation } from 'react-i18next';

import ContactInput from '../../../integrations/contact-input';
import { CONTACT_GROUP_TITLE_MAX_LENGTH } from '../../constants';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { updateBoard } = useBoardHooks();

	const initialTitle = 'New Group';
	const [titleValue, setTitleValue] = useState(initialTitle);

	const onTitleChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setTitleValue(ev.target.value);
			if (size(ev.target.value) === 0) {
				updateBoard({ title: '' });
			} else {
				updateBoard({ title: ev.target.value });
			}
		},
		[updateBoard]
	);

	const discardChanges = useCallback(() => {
		setTitleValue(initialTitle);
	}, []);

	const titleDescription = useMemo(() => {
		if (titleValue.trim().length === 0) {
			return 'Error: title length must be greater than 0';
		}
		if (titleValue.length > CONTACT_GROUP_TITLE_MAX_LENGTH) {
			return 'Error: title length can have maximum 256 characters';
		}
		return undefined;
	}, [titleValue]);

	return (
		<Container
			crossAlignment={'flex-end'}
			background={'gray5'}
			padding={{ horizontal: 'large', bottom: '2.625rem' }}
		>
			<Container
				gap={'0.5rem'}
				orientation={'horizontal'}
				mainAlignment={'flex-end'}
				height={'fit'}
				padding={{ vertical: '0.5rem' }}
			>
				<Button
					disabled={false}
					size={'medium'}
					label={'discard'}
					onClick={discardChanges}
					type="outlined"
				/>
				<Button
					disabled={titleValue.trim().length === 0 || titleValue.length > CONTACT_GROUP_TITLE_MAX_LENGTH}
					size={'medium'}
					label={'save'}
					icon={'SaveOutline'}
					onClick={noop}
				/>
			</Container>
			<Container
				height={'fit'}
				orientation={'horizontal'}
				mainAlignment={'flex-start'}
				gap={'1rem'}
			>
				<Avatar size="large" label="A Label" icon="PeopleOutline" />
				<Container height={'fit'} crossAlignment={'flex-start'}>
					<Text weight={'bold'}>New Group</Text>
					<Text color={'gray1'}>Addresses: 0</Text>
				</Container>
			</Container>
			<Container
				background={'gray6'}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
				padding={{ horizontal: 'small', top: 'small' }}
				gap={'0.5rem'}
			>
				<Input
					label={t('board.input.title.label', 'Group title*')}
					backgroundColor={'gray5'}
					borderColor={'gray3'}
					value={titleValue}
					onChange={onTitleChange}
					description={titleDescription}
					hasError={
						titleValue.trim().length === 0 || titleValue.length > CONTACT_GROUP_TITLE_MAX_LENGTH
					}
				/>
				<Text>{'Addresses list'}</Text>
				<Container
					orientation={'horizontal'}
					height={'fit'}
					gap={'0.5rem'}
					crossAlignment={'flex-start'}
				>
					<ContactInput
						defaultValue={[]}
						placeholder={'Insert an address to add a new element'}
						icon={'Plus'}
						iconAction={noop}
						iconDisabled
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default NewContactGroupBoard;
