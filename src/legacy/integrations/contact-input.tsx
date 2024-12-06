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
import { filter, find, map, uniqBy, noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionListChip } from './distribution-list-chip';
import { isValidEmail } from '../../carbonio-ui-commons/helpers/email-parser';
import { StoreProvider } from '../store/redux';
import type { ContactAddressMap } from '../types/contact';
import type { GetContactsRequest, GetContactsResponse } from '../types/soap';
import { Loader } from './parts/loader';
import { PasteContextMenu } from './parts/paste-context-menu';
import { getContactLabel, searchContacts, tryToParseEmail } from './parts/utils';
import {
	ContactInputItemInternalValue,
	ContactInputOptions,
	GroupContact,
	ContactInputItemInternal
} from './types';
import { EDIT_ACTION_ID, USER_TYPES_CONST } from '../../carbonio-ui-commons/integrations/constants';
import {
	ContactInputItem,
	ContactInputProps,
	UserContact,
	UserDistributionList,
	UserOrDL
} from '../../carbonio-ui-commons/integrations/types';

const MY_SPECIAL_ID_TO_EXCLUDE = 'my-special-id';

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

	const editChip = useCallback(
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

	const createChip = useCallback(
		(valueToAdd: string): ContactInputItem => {
			const id = valueToAdd;
			const parsedEmail = tryToParseEmail(valueToAdd);
			const isAValidEmail = isValidEmail(parsedEmail);
			const chip: ContactInputItem = {
				id,
				label: parsedEmail,
				value: {
					id,
					email: parsedEmail,
					type: USER_TYPES_CONST.CONTACT
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
						onClick: () => editChip(valueToAdd, id)
					}
				]
			};
			if (!isAValidEmail) {
				chip.avatarIcon = 'AlertCircleOutline';
			}
			return chip;
		},
		[editChip, t]
	);

	const onInternalChange = useCallback(
		(items: ContactInputItemInternal[]) => {
			const contactsWithoutGroups = reduce(
				items,
				(acc, item) => {
					const { value: itemValue, label } = item;
					if (label && itemValue && itemValue?.type !== USER_TYPES_CONST.GROUP) {
						acc.push({ ...item, label, value: itemValue });
					}
					return acc;
				},
				[] as ContactInputItem[]
			).filter((x) => x.id !== MY_SPECIAL_ID_TO_EXCLUDE);

			if (contactsWithoutGroups === defaultValue) {
				return;
			}
			const uniqueContacts = uniqBy(
				contactsWithoutGroups.filter((x) => x.id !== MY_SPECIAL_ID_TO_EXCLUDE),
				'value.email'
			);
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
		const chip = createChip(valueToAdd ?? '');
		if (valueToAdd !== '') {
			onChange?.([...defaults, { ...chip }]);
		}
		if (inputRef?.current) {
			inputRef.current.innerText = '';
		}
	}, [createChip, defaults, inputRef, onChange]);

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
						type: USER_TYPES_CONST.CONTACT
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
				return createChip(valueToAdd);
			}
			const contactValue = valueToAdd as ContactInputItemInternalValue;
			if (!contactValue) {
				throw new Error('no value in provided contact');
			}

			if (contactValue.type === USER_TYPES_CONST.GROUP) {
				getGroupMembers(contactValue)
					.then((userContacts) => userContacts.map((userContact) => onAdd(userContact)))
					.then((chipItems) => {
						onInternalChange([...defaults, ...chipItems]);
					});
				return {
					id: MY_SPECIAL_ID_TO_EXCLUDE,
					label: 'special-value',
					value: {
						email: 'whatever',
						id: 'whatever',
						type: USER_TYPES_CONST.CONTACT
					}
				};
			}

			const isEmailvalid = isValidEmail(contactValue.email);
			const editAction: ChipAction = {
				id: EDIT_ACTION_ID,
				label: isEmailvalid
					? t('label.edit_email', 'Edit E-mail')
					: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
				icon: 'EditOutline',
				type: 'button',
				onClick: (): void => editChip(contactValue.email, contactValue.id)
			};

			return {
				id: contactValue.id,
				label: getContactLabel(contactValue),
				value: contactValue,
				error: !isEmailvalid,
				actions: [editAction]
			};
		},
		[createChip, defaults, editChip, getGroupMembers, onInternalChange, t]
	);

	const onExpandDL = useCallback(
		(expandedDl: UserDistributionList, members: Array<string>) => {
			const valueWithoutDl = defaultValue.filter((val) => val.value.email !== expandedDl.email);
			const membersChips = members.map((member) => onAdd(member));
			const newItems = [...valueWithoutDl, ...membersChips];
			onInternalChange(newItems);
		},
		[defaultValue, onAdd, onInternalChange]
	);

	const ChipComponent = useCallback(
		(props: ChipItem<UserOrDL>): React.JSX.Element => {
			const val = props.value;
			return (
				<>
					{val && val.type === USER_TYPES_CONST.CONTACT && (
						<Chip {...props} data-testid={'default-chip'} />
					)}
					{val && props.label && val.type === USER_TYPES_CONST.DISTRIBUTION_LIST && (
						<DistributionListChip
							{...props}
							value={val}
							label={props.label}
							onExpandDL={onExpandDL}
						/>
					)}
				</>
			);
		},
		[onExpandDL]
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
					onChange={onInternalChange}
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
	<StoreProvider>
		<ContactInputCore {...props} />
	</StoreProvider>
);
