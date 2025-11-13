/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import {
	Container,
	Button,
	Text,
	Input,
	InputProps,
	Avatar,
	Row,
	List as DSList,
	type ChipInputProps
} from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import {
	FoldersSelector,
	ZIMBRA_STANDARD_COLORS,
	FOLDERS,
	getFolderIdParts,
	isSharedAccountFolder,
	ContactInputItem,
	useFolder,
	getFlatChildrenFolders,
	Folders,
	FolderSelectorItem,
	isValidEmail,
	CONTACT_TYPES
} from '@zextras/carbonio-ui-commons';
import { map, reduce, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { Hint } from '../../legacy/integrations/parts/hint';
import { Loader } from '../../legacy/integrations/parts/loader';
import { searchContacts, tryToParseEmail } from '../../legacy/integrations/parts/utils';
import { ContactInputOptions } from '../../legacy/integrations/types';
import { MemberListItemComponent } from 'components/member-list-item';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from 'constants/index';
import { ContactInput } from 'legacy/integrations/contact-input';

export function isContactGroupNameInvalid(nameValue: string): boolean {
	return nameValue.trim().length === 0 || nameValue.length > CONTACT_GROUP_NAME_MAX_LENGTH;
}

const List = styled(DSList)`
	min-height: 0;
`;

export type EnhancedChipItem = ContactInputItem & {
	duplicated: boolean;
};

export interface CommonContactGroupBoardProps {
	onSave: () => void;
	nameValue: string;
	memberListEmails: string[];
	isOnSaveDisabled: boolean;
	setMemberListEmails: React.Dispatch<React.SetStateAction<string[]>>;
	initialNameValue: string;
	initialFolderId?: string;
	setFolderId?: (selectedFolderId: string) => void;
	initialMemberListEmails: string[];
	setNameValue: React.Dispatch<React.SetStateAction<string>>;
}

export const CommonContactGroupBoard = ({
	onSave,
	nameValue,
	memberListEmails,
	isOnSaveDisabled,
	setMemberListEmails,
	initialNameValue,
	initialFolderId,
	setFolderId,
	initialMemberListEmails,
	setNameValue
}: CommonContactGroupBoardProps): React.JSX.Element => {
	const [t] = useTranslation();
	const contactFolder = useFolder(FOLDERS.CONTACTS);

	const folders = useMemo(() => {
		if (!contactFolder) return {};
		const folderState = getFlatChildrenFolders(contactFolder?.children ?? []);
		folderState[FOLDERS.CONTACTS] = contactFolder;
		return folderState;
	}, [contactFolder]);

	const folderWithWritePerm = reduce(
		folders,
		(accumulator, folder, index): Folders => {
			if (
				!isSharedAccountFolder(folder.id) &&
				(!folder.isLink || (folder.perm && folder.perm.indexOf('w') !== -1))
			) {
				accumulator[index] = folder;
			}
			return accumulator;
		},
		{} as Folders
	);

	const allFolders: FolderSelectorItem[] = useMemo(
		() =>
			map(folderWithWritePerm, (item) => ({
				label:
					getFolderIdParts(item.id).id === FOLDERS.CONTACTS
						? t('folders.contacts', 'Contacts')
						: item.name,
				value: item.id,
				color: ZIMBRA_STANDARD_COLORS[item.color ?? 0].hex
			})),
		[folderWithWritePerm, t]
	);

	const { updateBoard } = useBoardHooks();

	const onNameChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setNameValue(ev.target.value);
			updateBoard({ title: ev.target.value });
		},
		[setNameValue, updateBoard]
	);

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

	const discardChanges = useCallback(() => {
		setNameValue(initialNameValue);
		setMemberListEmails(initialMemberListEmails);
		updateBoard({ title: initialNameValue });
	}, [initialMemberListEmails, initialNameValue, setMemberListEmails, setNameValue, updateBoard]);

	const contactInputOnChange = (
		newContactInputValue: Array<
			Omit<EnhancedChipItem, 'duplicated'> & { duplicated?: Pick<EnhancedChipItem, 'duplicated'> }
		>
	): void => {
		// TODO item are filtered to be uniq, because the ContactInput filters out, dropdown duplicated, only visually
		//  but provide that item inside onChange parameter
		const uniqNewContactInputValue = uniqBy(newContactInputValue, (chip) => chip.value.email);

		const newMembers = uniqNewContactInputValue.reduce<string[]>((acc, chip) => {
			if (!memberListEmails.includes(chip.value.email)) {
				acc.push(chip.value.email);
			}
			return acc;
		}, []);

		setMemberListEmails((prevState) => [...newMembers, ...prevState]);
	};

	const removeItem = useCallback(
		(emailToRemove: string) => {
			const newMemberListEmails = memberListEmails.filter((value) => value !== emailToRemove);
			setMemberListEmails(newMemberListEmails);
		},
		[memberListEmails, setMemberListEmails]
	);

	const [showInvalidAddressDescription, setShowInvalidAddressDescription] = useState(false);

	const contactInputDescription = useMemo(() => {
		if (showInvalidAddressDescription) {
			return t('board.newContactGroup.input.contact_input.error.invalid_address', {
				count: 1,
				defaultValue_one: 'Invalid address',
				defaultValue_other: 'Invalid addresses'
			});
		}
		return undefined;
	}, [t, showInvalidAddressDescription]);

	const listItems = useMemo(
		(): Array<React.JSX.Element> =>
			memberListEmails.map((item: string) => (
				<MemberListItemComponent key={item} email={item} onRemove={(): void => removeItem(item)} />
			)),
		[memberListEmails, removeItem]
	);

	const [options, setOptions] = useState<Array<ContactInputOptions>>([]);

	const inputRef = useRef<HTMLInputElement>(null);

	const onInputEnter = useCallback((): void => {
		if (inputRef?.current) {
			const valueToAdd = inputRef.current?.value.replaceAll('\n', '');
			if (valueToAdd !== '') {
				if (isValidEmail(valueToAdd)) {
					const parsedEmail = tryToParseEmail(valueToAdd);
					setMemberListEmails((prevState) => {
						if (!prevState.includes(parsedEmail)) {
							return [parsedEmail, ...prevState];
						}
						return prevState;
					});
					inputRef.current.value = '';
				} else {
					setShowInvalidAddressDescription(true);
				}
			}
		}
	}, [setMemberListEmails]);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (key === 'Enter') {
				setOptions([]);
				onInputEnter();
				return;
			}
			setShowInvalidAddressDescription(false);
			if (textContent && textContent !== '') {
				setOptions([
					{
						id: 'loading',
						label: 'loading',
						customComponent: <Loader />
					}
				]);
				searchContacts(textContent, [])
					.then((contactInputItems) => {
						if (contactInputItems.length > 0) {
							setOptions(contactInputItems);
						} else if (isValidEmail(textContent)) {
							const parsedEmail = tryToParseEmail(textContent);
							const contact = {
								id: parsedEmail,
								email: parsedEmail,
								type: CONTACT_TYPES.CONTACT
							};
							setOptions([
								{
									label: parsedEmail,
									value: contact,
									id: parsedEmail,
									customComponent: <Hint email={contact.email} label={parsedEmail} />
								}
							]);
						} else {
							setOptions([]);
						}
					})
					.catch(() => {
						setOptions([]);
					});
			} else {
				setOptions([]);
			}
		},
		[onInputEnter]
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
					disabled={isOnSaveDisabled}
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
					background={'gray5'}
					borderColor={'gray3'}
					value={nameValue}
					onChange={onNameChange}
					description={nameDescription}
					hasError={
						nameValue.trim().length === 0 || nameValue.length > CONTACT_GROUP_NAME_MAX_LENGTH
					}
				/>
				{initialFolderId && setFolderId && (
					<Row padding={{ top: '0.5rem' }} width={'fill'}>
						<FoldersSelector
							defaultFolderId={initialFolderId}
							onChange={(value): void => setFolderId(value as string)}
							label={t('label.destination_address_book', 'Destination Address Book')}
							folderItems={allFolders}
						/>
					</Row>
				)}
				<Row padding={{ top: '0.5rem' }}>
					<Text color={'secondary'}>
						{t('board.newContactGroup.input.contact_input.title', 'Addresses list')}
					</Text>
				</Row>
				<Container orientation={'horizontal'} height={'fit'} crossAlignment={'flex-start'}>
					<ContactInput
						data-testid={'contact-group-contact-input'}
						defaultValue={[]}
						onChange={contactInputOnChange}
						placeholder={t(
							'board.newContactGroup.input.contact_input.placeholder2',
							'Type an address'
						)}
						// @ts-expect-error types are not aligned
						options={options}
						inputRef={inputRef}
						onInputType={onInputType}
						confirmChipOnBlur={false}
						separators={[]}
						description={contactInputDescription}
						hasError={showInvalidAddressDescription}
					/>
				</Container>
				<List data-testid={'members-list'}>{listItems}</List>
			</Container>
		</Container>
	);
};
