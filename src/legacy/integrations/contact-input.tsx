/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef, useState, ReactElement, FC, useMemo } from 'react';

import {
	ChipInput,
	Container,
	type ChipInputProps,
	useCombinedRefs,
	ChipAction,
	ChipItem,
	Chip
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import {
	isValidEmail,
	EDIT_ACTION_ID,
	CONTACT_TYPES,
	ContactInputItem,
	ContactInputProps,
	UserContact,
	DistributionListContact,
	UserOrDL
} from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';
import { filter, find, map, uniqBy, noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionListChip } from 'legacy/integrations/distribution-list-chip';
import { Loader } from 'legacy/integrations/parts/loader';
import { PasteContextMenu } from 'legacy/integrations/parts/paste-context-menu';
import { getContactLabel, searchContacts, tryToParseEmail } from 'legacy/integrations/parts/utils';
import {
	ContactInputItemInternalValue,
	ContactInputOptions,
	GroupContact
} from 'legacy/integrations/types';
import type { ContactAddressMap } from 'legacy/types/contact';
import type { GetContactsRequest, GetContactsResponse } from 'legacy/types/soap';

const CHIP_TO_EXCLUDE = 'this-value-represent-a-chip-that-should-not-be-present';

type EditChipFn = (text: string, id: string) => void;
function createChipFromEmail(
	t: TFunction,
	editChipFn: EditChipFn,
	valueToAdd: string
): ContactInputItem {
	const id = valueToAdd;
	const parsedEmail = tryToParseEmail(valueToAdd);
	const isAValidEmail = isValidEmail(parsedEmail);
	const chip: ContactInputItem = {
		id,
		label: parsedEmail,
		value: {
			id,
			email: parsedEmail,
			type: CONTACT_TYPES.CONTACT
		},
		error: !isAValidEmail,
		actions: [
			{
				id: EDIT_ACTION_ID,
				label: isAValidEmail
					? t('label.edit_email', 'Edit E-mail')
					: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
				icon: 'EditOutline',
				type: 'button',
				onClick: () => editChipFn(valueToAdd, id)
			}
		]
	};
	if (!isAValidEmail) {
		chip.avatarIcon = 'AlertCircleOutline';
	}
	return chip;
}
const ContactInputCore: FC<ContactInputProps> = ({
	onChange,
	defaultValue,
	placeholder,
	background = 'gray5',
	dragAndDropEnabled = false,
	orderedAccountIds = [],
	inputRef: propsInputRef = null,
	...rest
}) => {
	const [defaults, setDefaults] = useState<Array<ContactInputItem>>([]);
	const [options, setOptions] = useState<Array<ContactInputOptions>>([]);
	const [idToRemove, setIdToRemove] = useState('');
	const [t] = useTranslation();
	const inputRef = useCombinedRefs(propsInputRef);
	const emptyDraggedChip = useMemo(() => ({ id: '', email: '', dragStartRef: null }), []);
	const draggedChip = useRef<{
		id?: string;
		email?: string | ContactAddressMap;
		dragStartRef: HTMLInputElement | null;
	}>(emptyDraggedChip);
	const isSameElement = useRef(false);

	const buildDragStartHandler = useCallback(
		(chip: ContactInputItem) => (ev: React.DragEvent) => {
			ev.dataTransfer.setData('contact', JSON.stringify(chip));
			ev.dataTransfer.dropEffect = 'move';
			draggedChip.current = {
				id: chip.id,
				dragStartRef: inputRef.current
			};
		},
		[inputRef]
	);
	useEffect(() => {
		setDefaults(
			map(filter(defaultValue, (c) => c.id !== idToRemove) ?? [], (obj) => ({
				...obj,
				draggable: dragAndDropEnabled,
				onDragStart: dragAndDropEnabled ? buildDragStartHandler(obj) : noop
			}))
		);
	}, [buildDragStartHandler, defaultValue, dragAndDropEnabled, idToRemove]);

	const buildDraggableChip = useCallback(
		(chip: ContactInputItem): ContactInputItem => ({
			...chip,
			draggable: true,
			onDragStart: buildDragStartHandler(chip)
		}),
		[buildDragStartHandler]
	);

	const editChip = useCallback<EditChipFn>(
		(text: string, id: string) => {
			setIdToRemove(id);
			if (inputRef?.current) {
				inputRef.current.value = text;
				inputRef.current.style.width = inputRef.current.value
					? `${inputRef.current.scrollWidth}px`
					: '';
			}
		},
		[inputRef]
	);

	const handleChipOnChange = useCallback(
		(items: ChipItem<UserOrDL>[]) => {
			const contactsWithoutGroups = reduce(
				items,
				(acc, item) => {
					const { value: itemValue, label } = item;
					if (label && itemValue) {
						acc.push({ ...item, label, value: itemValue });
					}
					return acc;
				},
				[] as ContactInputItem[]
			).filter((x) => x.id !== CHIP_TO_EXCLUDE);

			if (contactsWithoutGroups === defaultValue) {
				return;
			}
			const uniqueContacts = uniqBy(contactsWithoutGroups, 'value.email');
			onChange?.(uniqueContacts);
		},
		[onChange, defaultValue]
	);

	const onInputEnter = useCallback((): void => {
		if (inputRef?.current) {
			// FIXME: innerText does not contain new line chars at this point
			inputRef.current.innerText = inputRef.current.innerText?.replaceAll('\n', '');
		}
		const valueToAdd = inputRef.current?.innerText.replaceAll('\n', '');
		const chip = createChipFromEmail(t, editChip, valueToAdd ?? '');
		if (valueToAdd !== '') {
			handleChipOnChange([...defaults, { ...chip }]);
		}
		if (inputRef?.current) {
			inputRef.current.innerText = '';
		}
	}, [inputRef, t, editChip, handleChipOnChange, defaults]);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (key === 'Enter') {
				onInputEnter();
				return;
			}
			if (textContent && textContent !== '') {
				setOptions([
					{
						id: 'loading',
						label: 'loading',
						customComponent: <Loader />
					}
				]);
				searchContacts(textContent, orderedAccountIds)
					.then((contactinputItems) => {
						setOptions(contactinputItems);
					})
					.catch(() => {
						setOptions([]);
					});
			} else {
				setOptions([]);
			}
		},
		[onInputEnter, orderedAccountIds]
	);

	const getGroupMembers = useCallback(
		(contactGroup: GroupContact): Promise<UserContact[]> =>
			soapFetch<GetContactsRequest, GetContactsResponse>('GetContacts', {
				_jsns: 'urn:zimbraMail',
				cn: {
					id: contactGroup.groupId
				},
				derefGroupMember: true
			}).then((result) => {
				const members = result?.cn?.[0].m;
				return map(members, (member) => {
					const email = member.cn?.[0]._attrs.email ?? member.value;
					return {
						email,
						id: email,
						type: CONTACT_TYPES.CONTACT
					};
				});
			}),
		[]
	);

	const contactInputValue = useMemo(() => uniqBy(defaults, 'id'), [defaults]);

	const onAdd = useCallback(
		(valueToAdd: unknown): ContactInputItem => {
			setIdToRemove('');
			if (typeof valueToAdd === 'string') {
				return createChipFromEmail(t, editChip, valueToAdd);
			}
			const selectedOption = valueToAdd as ContactInputItemInternalValue;
			if (!selectedOption) {
				throw new Error('no value in provided contact');
			}

			if (selectedOption.type === CONTACT_TYPES.GROUP) {
				getGroupMembers(selectedOption)
					.then((userContacts) => userContacts.map((userContact) => onAdd(userContact)))
					.then((chipItems) => {
						handleChipOnChange([...defaults, ...chipItems]);
					});
				return {
					id: CHIP_TO_EXCLUDE,
					label: '',
					value: {
						email: '',
						id: '',
						type: CONTACT_TYPES.CONTACT
					}
				};
			}

			const isEmailValid = isValidEmail(selectedOption.email);
			const editAction: ChipAction = {
				id: EDIT_ACTION_ID,
				label: isEmailValid
					? t('label.edit_email', 'Edit E-mail')
					: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
				icon: 'EditOutline',
				type: 'button',
				onClick: (): void => editChip(selectedOption.email, selectedOption.id)
			};

			return {
				id: selectedOption.id,
				label: getContactLabel(selectedOption),
				value: selectedOption,
				error: !isEmailValid,
				actions: [editAction]
			};
		},
		[defaults, editChip, getGroupMembers, handleChipOnChange, t]
	);

	const onExpandDistributionList = useCallback(
		(expandedDl: DistributionListContact, members: Array<string>) => {
			const chipsWithoutDl = defaultValue.filter((val) => val.value.email !== expandedDl.email);
			const membersChips = members.map((member) => onAdd(member));
			const updatedChips = [...chipsWithoutDl, ...membersChips];
			handleChipOnChange(updatedChips);
		},
		[defaultValue, onAdd, handleChipOnChange]
	);

	const ChipComponent = useCallback(
		(props: ChipItem<UserOrDL>): React.JSX.Element => {
			const val = props.value;
			return (
				<>
					{val && val.type === CONTACT_TYPES.CONTACT && (
						<Chip {...props} data-testid={'default-chip'} />
					)}
					{val && props.label && val.type === CONTACT_TYPES.DISTRIBUTION_LIST && (
						<DistributionListChip
							{...props}
							value={val}
							label={props.label}
							onExpandDL={onExpandDistributionList}
						/>
					)}
				</>
			);
		},
		[onExpandDistributionList]
	);

	const onDragEnter = useCallback<React.DragEventHandler>((ev) => {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move';
	}, []);

	const resetDraggedChip = useCallback(() => {
		draggedChip.current = emptyDraggedChip;
	}, [emptyDraggedChip]);

	const onDragEnd = useCallback<React.DragEventHandler>(
		(ev) => {
			ev.preventDefault();
			// if the drop is cancelled (e.g. by dropping outside of the dropzone or by pressing ESC), no dragleave action is fired
			if (ev?.dataTransfer?.dropEffect === 'none' || isSameElement.current) {
				resetDraggedChip();
				isSameElement.current = false;
				return;
			}
			setDefaults((prevState) =>
				filter(prevState, (contact) => contact.id !== draggedChip.current.id)
			);
			const newDefaults = filter(defaults, (c) => c.id !== draggedChip.current.id);
			onChange?.(newDefaults);
			resetDraggedChip();
			isSameElement.current = false;
		},
		[defaults, onChange, resetDraggedChip]
	);

	const onDrop = useCallback<React.DragEventHandler>(
		(ev) => {
			ev.preventDefault();
			if (draggedChip.current.dragStartRef === inputRef.current) {
				isSameElement.current = true;
				resetDraggedChip();
				return;
			}
			const chipJson = ev.dataTransfer.getData('contact');
			if (chipJson) {
				const chip = JSON.parse(chipJson);
				const newChip = buildDraggableChip(chip);
				setDefaults((prevState) =>
					find(prevState, { id: newChip.id }) ? prevState : { ...prevState, newChip }
				);
				onChange?.([...defaults, { ...newChip }]);
				resetDraggedChip();
				isSameElement.current = false;
			}
		},
		[buildDraggableChip, defaults, inputRef, onChange, resetDraggedChip]
	);

	return (
		<Container width="100%" onDrop={onDrop} height="100%">
			<PasteContextMenu elementReceivingPaste={inputRef.current}>
				<ChipInput<UserOrDL>
					data-testid={'contact-input'}
					disableOptions
					placeholder={placeholder}
					confirmChipOnBlur
					inputRef={inputRef}
					onInputType={onInputType}
					onChange={handleChipOnChange}
					options={options}
					value={contactInputValue}
					background={background}
					onAdd={onAdd}
					requireUniqueChips
					createChipOnPaste
					pasteSeparators={[',', ';', '\n']}
					separators={[
						{ code: 'Enter', ctrlKey: false },
						{ code: 'NumpadEnter', ctrlKey: false },
						{ key: ',', ctrlKey: false },
						{ key: ';', ctrlKey: false }
					]}
					ChipComponent={ChipComponent}
					onDragEnter={dragAndDropEnabled ? onDragEnter : noop}
					onDragOver={dragAndDropEnabled ? onDragEnter : noop}
					onDragEnd={dragAndDropEnabled ? onDragEnd : noop}
					{...rest}
				/>
			</PasteContextMenu>
		</Container>
	);
};

export const ContactInput = (props: ContactInputProps): ReactElement => (
	<ContactInputCore {...props} />
);
