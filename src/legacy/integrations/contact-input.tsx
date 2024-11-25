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
	type ChipItem,
	type ChipInputProps,
	type DropdownItem,
	useCombinedRefs
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, find, map, forEach, reject, uniqBy, noop } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { isValidEmail } from '../../carbonio-ui-commons/helpers/email-parser';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { StoreProvider } from '../store/redux';
import type {
	ContactAddressMap,
	FullAutocompleteRequest,
	FullAutocompleteResponse
} from '../types/contact';
import type { ContactInputGroup, ContactInputItem, ContactInputValue } from '../types/integrations';
import type { GetContactsRequest, GetContactsResponse } from '../types/soap';
import { Hint } from './parts/hint';
import { Loader } from './parts/loader';
import { PasteContextMenu } from './parts/paste-context-menu';
import {
	getChipLabel,
	isContactGroup,
	tryToParseEmail,
	getContactId,
	mapToContactInputItem
} from './parts/utils';
import { ContactInputProps } from './types';

const ContactInputCore: FC<ContactInputProps> = ({
	onChange,
	defaultValue,
	placeholder,
	background = 'gray5',
	dragAndDropEnabled = false,
	chipDisplayName = CHIP_DISPLAY_NAME_VALUES.label,
	orderedAccountIds = [],
	contactActions,
	inputRef: propsInputRef = null,
	...rest
}) => {
	const [defaults, setDefaults] = useState<ContactInputValue>([]);
	const [options, setOptions] = useState<Array<DropdownItem & { value?: ContactInputItem }>>([]);
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
				email: chip.email ?? chip.address,
				dragStartRef: inputRef.current
			};
		},
		[inputRef]
	);
	useEffect(() => {
		setDefaults(
			map(filter(defaultValue, (c) => c.id !== idToRemove) ?? [], (obj) => ({
				...obj,
				label: getChipLabel(obj),
				draggable: dragAndDropEnabled,
				onDragStart: dragAndDropEnabled ? buildDragStartHandler(obj) : noop
			}))
		);
	}, [buildDragStartHandler, defaultValue, dragAndDropEnabled, idToRemove]);

	const buildDraggableChip = useCallback(
		(chip: ContactInputItem): ChipItem => ({
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
				email: parsedEmail,
				label: parsedEmail,
				error: !isAValidEmail,
				actions: [
					{
						id: 'action1',
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

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (key === 'Enter') {
				if (inputRef?.current) {
					// FIXME: innerText does not contain new line chars at this point
					inputRef.current.innerText = inputRef.current.innerText?.replaceAll('\n', '');
				}
				if (options.length > 0 && !find(options, { id: 'loading' })) {
					onChange?.([
						...defaults,
						{
							...options[0].value
						}
					]);
					if (inputRef.current) {
						inputRef.current.innerText = '';
					}
					setOptions([]);
					return;
				}
				const valueToAdd = inputRef.current?.innerText.replaceAll('\n', '');
				const chip = createChip(valueToAdd ?? '');
				if (valueToAdd !== '') {
					onChange?.([...defaults, { ...chip }]);
				}
				if (inputRef?.current) {
					inputRef.current.innerText = '';
				}
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
				soapFetch<FullAutocompleteRequest, FullAutocompleteResponse>('FullAutocomplete', {
					...(orderedAccountIds?.length > 0 && {
						orderedAccountIds: orderedAccountIds.toString()
					}),
					AutoCompleteRequest: {
						name: textContent,
						includeGal: 1
					},
					_jsns: 'urn:zimbraMail'
				})
					.then((autoCompleteResult) => map(autoCompleteResult.match, mapToContactInputItem))
					.then((contactinputItems) => {
						setOptions(
							map(contactinputItems, (contactinputItem) => ({
								label: contactinputItem?.label ?? getChipLabel(contactinputItem),
								value: contactinputItem,
								customComponent: <Hint contact={contactinputItem} />,
								id: getContactId(contactinputItem)
							}))
						);
					})
					.catch(() => {
						setOptions([]);
					});
			} else {
				setOptions([]);
			}
		},
		[createChip, defaults, inputRef, onChange, options, orderedAccountIds]
	);

	useEffect(() => {
		const groups = filter(defaults, (def): def is ContactInputGroup => isContactGroup(def));
		if (groups.length > 0) {
			forEach(groups, (def) => {
				soapFetch<GetContactsRequest, GetContactsResponse>('GetContacts', {
					_jsns: 'urn:zimbraMail',
					cn: {
						id: def.groupId
					},
					derefGroupMember: true
				}).then((result) => {
					const id = Date.now().toString();
					const members = result?.cn?.[0].m;
					const newContacts = map(members, (member): ContactInputItem => {
						const email = member.cn?.[0]._attrs.email ?? member.value;
						return {
							email,
							id,
							label: email,
							error: !isValidEmail(email),
							draggable: true,
							onDragStart: buildDragStartHandler({ id, email, label: email })
						};
					});
					const newValue = reject(defaults, (chip) => isContactGroup(chip));
					const updatedValue = [...newValue, ...newContacts];
					onChange?.(updatedValue);
					setDefaults(updatedValue);
				});
			});
		}
	}, [buildDragStartHandler, defaults, onChange]);

	const contactInputValue = useMemo(() => uniqBy(defaults, 'email'), [defaults]);

	const onAdd = useCallback(
		(valueToAdd: ContactInputItem) => {
			setIdToRemove('');
			if (typeof valueToAdd === 'string') {
				return createChip(valueToAdd);
			}
			return {
				...valueToAdd,
				error: !isValidEmail(valueToAdd.email),
				actions: [
					{
						id: 'action1',
						label: isValidEmail(valueToAdd.email)
							? t('label.edit_email', 'Edit E-mail')
							: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
						icon: 'EditOutline',
						type: 'button',
						onClick: () => editChip(valueToAdd.email ?? '', valueToAdd.id ?? '')
					}
				]
			};
		},
		[createChip, editChip, t]
	);

	const ChipComponent = useCallback(
		(
			props: React.ComponentPropsWithoutRef<NonNullable<ChipInputProps['ChipComponent']>>
		): React.JSX.Element => (
			<ContactInputCustomChipComponent
				{...props}
				contactActions={contactActions}
				chipDisplayName={chipDisplayName}
				contactInputOnChange={onChange}
				contactInputValue={contactInputValue}
			/>
		),
		[chipDisplayName, contactActions, contactInputValue, onChange]
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
			const newDefaults = filter(defaults, (c) => {
				if (c.email) {
					return c.email !== draggedChip.current.email;
				}
				return c.id !== draggedChip.current.id;
			});
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
				<ChipInput
					data-testid={'contact-input'}
					disableOptions
					placeholder={placeholder}
					confirmChipOnBlur
					inputRef={inputRef}
					onInputType={onInputType}
					onChange={onChange}
					options={options}
					value={contactInputValue}
					background={background}
					onAdd={onAdd as ChipInputProps['onAdd']}
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
