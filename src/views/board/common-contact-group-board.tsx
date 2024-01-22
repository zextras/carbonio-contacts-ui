/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import {
	Container,
	Button,
	Text,
	Input,
	InputProps,
	Avatar,
	ListV2,
	Row,
	ChipItem
} from '@zextras/carbonio-design-system';
import { some } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MemberListItemComponent } from '../../components/member-list-item';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from '../../constants';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { ContactInput } from '../../legacy/integrations/contact-input';

const List = styled(ListV2)`
	min-height: 0;
`;

export type EnhancedChipItem = ChipItem & {
	email: string;
	duplicated: boolean;
};

export interface CommonContactGroupBoardProps {
	onSave: () => void;
	discardChanges: () => void;
	nameValue: string;
	onNameChange: NonNullable<InputProps['onChange']>;
	contactInputValue: Array<EnhancedChipItem>;
	contactInputOnChange: (
		newContactInputValue: Array<
			Omit<EnhancedChipItem, 'duplicated'> & { duplicated?: Pick<EnhancedChipItem, 'duplicated'> }
		>
	) => void;
	contactInputIconAction: () => void;
	removeItem: (email: string) => void;
	memberListEmails: string[];
}

const CommonContactGroupBoard = ({
	onSave,
	discardChanges,
	nameValue,
	onNameChange,
	contactInputValue,
	contactInputOnChange,
	contactInputIconAction,
	removeItem,
	memberListEmails
}: CommonContactGroupBoardProps): React.JSX.Element => {
	const [t] = useTranslation();

	const nameDescription = useMemo(() => {
		if (nameValue.trim().length === 0) {
			return t(
				'board.newContactGroup.input.name_input.error.required',
				'Group name is required, enter a name to proceed'
			);
		}
		if (nameValue.length > CONTACT_GROUP_NAME_MAX_LENGTH) {
			return t(
				'board.newContactGroup.input.name_input.error.max_length',
				'Maximum length allowed is 256 characters'
			);
		}
		return undefined;
	}, [t, nameValue]);

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
		});
		if (valid > 0) {
			return undefined;
		}
		if (invalid > 0 && duplicated > 0) {
			return t(
				'board.newContactGroup.input.contact_input.error.invalid_already_present_addresses',
				'Invalid and already present addresses'
			);
		}
		if (invalid > 0 && duplicated === 0) {
			return t('board.newContactGroup.input.contact_input.error.invalid_address', {
				count: invalid,
				defaultValue: 'Invalid address',
				defaultValue_plural: 'Invalid addresses'
			});
		}
		if (duplicated > 0 && invalid === 0) {
			return t('board.newContactGroup.input.contact_input.error.address_already_present', {
				count: duplicated,
				defaultValue: 'Address already present',
				defaultValue_plural: 'Addresses already present'
			});
		}
		return undefined;
	}, [contactInputValue, t]);

	const noValidChip = useMemo(
		() => !some(contactInputValue, (chip) => !chip.error && !chip.duplicated),
		[contactInputValue]
	);

	const listItems = useMemo(
		(): Array<React.JSX.Element> =>
			memberListEmails.map((item: string) => (
				<MemberListItemComponent key={item} email={item} onRemove={(): void => removeItem(item)} />
			)),
		[memberListEmails, removeItem]
	);

	return (
		<Container
			crossAlignment={'flex-end'}
			background={'gray5'}
			padding={{ horizontal: 'large', bottom: '2.625rem' }}
			height={'fill'}
			minHeight={'30rem'}
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
					label={t('label.discard', 'discard')}
					onClick={discardChanges}
					type="outlined"
				/>
				<Button
					disabled={
						nameValue.trim().length === 0 || nameValue.length > CONTACT_GROUP_NAME_MAX_LENGTH
					}
					size={'medium'}
					label={t('label.save', 'save')}
					icon={'SaveOutline'}
					onClick={onSave}
				/>
			</Container>
			<Container
				height={'fit'}
				orientation={'horizontal'}
				mainAlignment={'flex-start'}
				gap={'1rem'}
				padding={'1rem 0'}
			>
				<Avatar size="large" label={nameValue} icon="PeopleOutline" />
				<Container height={'fit'} crossAlignment={'flex-start'} minWidth={0}>
					<Text weight={'bold'}>{nameValue}</Text>
					<Text color={'gray1'}>
						{t('board.newContactGroup.addresses.label', 'Addresses')}: {memberListEmails.length}
					</Text>
				</Container>
			</Container>
			<Container
				background={'gray6'}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
				padding={{ horizontal: 'large', top: 'large' }}
				gap={'0.5rem'}
				height={'calc(100% - 8rem)'}
			>
				<Input
					label={t('board.newContactGroup.input.name_input.name.label', 'Group name*')}
					backgroundColor={'gray5'}
					borderColor={'gray3'}
					value={nameValue}
					onChange={onNameChange}
					description={nameDescription}
					hasError={
						nameValue.trim().length === 0 || nameValue.length > CONTACT_GROUP_NAME_MAX_LENGTH
					}
				/>
				<Row padding={{ top: '0.5rem' }}>
					<Text color={'secondary'}>
						{t('board.newContactGroup.input.contact_input.title', 'Addresses list')}
					</Text>
				</Row>
				<Container orientation={'horizontal'} height={'fit'} crossAlignment={'flex-start'}>
					<ContactInput
						data-testid={'contact-group-contact-input'}
						// FIXME: remove ts-ignore when contact-input types are fixed
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						defaultValue={contactInputValue}
						// FIXME: remove ts-ignore when contact-input types are fixed
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						onChange={contactInputOnChange}
						placeholder={t(
							'board.newContactGroup.input.contact_input.placeholder',
							'Type an address, click ‘+’ to add to the group'
						)}
						icon={'Plus'}
						iconAction={contactInputIconAction}
						iconDisabled={noValidChip}
						description={contactInputDescription}
						hasError={contactInputValue.length > 0 && noValidChip}
						chipDisplayName={CHIP_DISPLAY_NAME_VALUES.email}
					/>
				</Container>
				<List data-testid={'members-list'}>{listItems}</List>
			</Container>
		</Container>
	);
};

export default CommonContactGroupBoard;
