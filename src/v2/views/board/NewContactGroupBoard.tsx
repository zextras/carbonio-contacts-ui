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
	Avatar,
	ListV2,
	Row
} from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { noop, size, some, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { MemberListItemComponent } from '../../../components/member-list-item';
import ContactInput from '../../../integrations/contact-input';
import { CONTACT_GROUP_TITLE_MAX_LENGTH } from '../../constants';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { updateBoard } = useBoardHooks();

	const initialTitle = 'New Group';
	const [titleValue, setTitleValue] = useState(initialTitle);

	const [contactInputValue, setContactInputValue] = useState<
		Array<{ email: string; error: boolean; duplicated: boolean }>
	>([]);

	const [memberListEmails, setMemberListEmails] = useState<string[]>([]);

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
		setContactInputValue([]);
		setMemberListEmails([]);
	}, []);

	const titleDescription = useMemo(() => {
		if (titleValue.trim().length === 0) {
			return 'Group name is required, enter a name to proceed';
		}
		if (titleValue.length > CONTACT_GROUP_TITLE_MAX_LENGTH) {
			return 'Maximum length allowed is 256 characters';
		}
		return undefined;
	}, [titleValue]);

	const contactInputDescription = useMemo(() => {
		let valid = 0;
		let duplicated = 0;
		let invalid = 0;

		contactInputValue.forEach((value) => {
			if (value.duplicated) {
				duplicated += 1;
			} else if (value.error) {
				invalid += 1;
			} else {
				valid += 1;
			}
			if (value.error && value.duplicated) {
				throw new Error(
					'Invalid case reached: should not have duplicated and invalid chips at the same time'
				);
			}
		});

		if (valid > 0) {
			return undefined;
		}
		if (invalid > 0 && duplicated > 0) {
			return 'Invalid and already present addresses';
		}
		if (invalid === 1 && duplicated === 0) {
			return 'Invalid address';
		}
		if (invalid > 1 && duplicated === 0) {
			return 'Invalid addresses';
		}
		if (duplicated === 1 && invalid === 0) {
			return 'Address already present';
		}
		if (duplicated > 1 && invalid === 0) {
			return 'Addresses already present';
		}
		// TODO add test
		return undefined;
	}, [contactInputValue]);

	const contactInputOnChange = (
		newContactInputValue: Array<{ email: string; error: boolean; duplicated?: boolean }>
	): void => {
		// TODO item are filtered to be uniq, because the ContactInput filters out, dropdown duplicated, only visually
		//  but provide that item inside onChange parameter
		const uniqNewContactInputValue = uniqBy(newContactInputValue, 'email');

		const mapped = uniqNewContactInputValue.map((value) => ({
			...value,
			duplicated: memberListEmails.includes(value.email)
		}));

		setContactInputValue(mapped);
	};

	const noValidChip = useMemo(
		() => !some(contactInputValue, (chip) => !chip.error && !chip.duplicated),
		[contactInputValue]
	);

	const removeItem = useCallback(
		(email: string) => {
			const newMemberListEmails = memberListEmails.filter((value) => value !== email);
			setMemberListEmails(newMemberListEmails);
			setContactInputValue((prevState) =>
				prevState.map((value) => ({
					...value,
					duplicated: newMemberListEmails.includes(value.email)
				}))
			);
		},
		[memberListEmails]
	);

	const listItems = useMemo(
		(): Array<React.JSX.Element> =>
			memberListEmails.map((item: string) => (
				<MemberListItemComponent key={item} email={item} onRemove={(): void => removeItem(item)} />
			)),
		[memberListEmails, removeItem]
	);

	const contactInputIconAction = useCallback(() => {
		const valid: typeof contactInputValue = [];
		const invalid: typeof contactInputValue = [];

		contactInputValue.forEach((value) => {
			if (value.error || value.duplicated) {
				invalid.push(value);
			} else {
				valid.push(value);
			}
		});

		setContactInputValue(invalid);
		setMemberListEmails((prevState) => [...prevState, ...valid.map((value) => value.email)]);
	}, [contactInputValue]);

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
					disabled={
						titleValue.trim().length === 0 || titleValue.length > CONTACT_GROUP_TITLE_MAX_LENGTH
					}
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
				<Avatar size="large" label={titleValue} icon="PeopleOutline" />
				<Container height={'fit'} crossAlignment={'flex-start'}>
					<Text weight={'bold'}>{titleValue}</Text>
					<Text color={'gray1'}>Addresses: {memberListEmails.length}</Text>
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
				<Row>
					<Text>{'Addresses list'}</Text>
				</Row>
				<Container
					orientation={'horizontal'}
					height={'fit'}
					gap={'0.5rem'}
					crossAlignment={'flex-start'}
				>
					<ContactInput
						data-testid={'contact-group-contact-input'}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						defaultValue={contactInputValue}
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						onChange={contactInputOnChange}
						placeholder={'Type an address, click ‘+’ to add to the group'}
						icon={'Plus'}
						iconAction={contactInputIconAction}
						iconDisabled={noValidChip}
						description={contactInputDescription}
						hasError={noValidChip}
					/>
				</Container>
				<ListV2 data-testid={'member-list'}>{listItems}</ListV2>
			</Container>
		</Container>
	);
};

export default NewContactGroupBoard;
