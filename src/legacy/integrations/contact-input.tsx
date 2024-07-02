/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef, useState, ReactElement, FC, useMemo } from 'react';

import {
	Avatar,
	ChipInput,
	Container,
	Row,
	Text,
	type ChipItem,
	type ChipInputProps,
	type DropdownItem,
	useCombinedRefs
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, find, map, trim, forEach, reject, uniqBy, noop, unescape } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled, { type DefaultTheme } from 'styled-components';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { isValidEmail, parseEmail } from '../../carbonio-ui-commons/helpers/email-parser';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { StoreProvider } from '../store/redux';
import type { FullAutocompleteRequest, FullAutocompleteResponse, Match } from '../types/contact';
import type {
	ContactChipAction,
	ContactInputChipDisplayName,
	ContactInputGroup,
	ContactInputItem,
	ContactInputOnChange,
	ContactInputValue
} from '../types/integrations';
import type { GetContactsRequest, GetContactsResponse } from '../types/soap';

function isContactGroup(contact: {
	isGroup?: boolean;
	display?: string | null;
	email?: string;
}): contact is ContactInputGroup {
	return (
		(contact?.isGroup &&
			contact?.display !== undefined &&
			contact?.display !== null &&
			!contact?.email) ??
		false
	);
}

const getChipLabel = (
	contact: Pick<
		ContactInputItem,
		'firstName' | 'middleName' | 'lastName' | 'email' | 'address' | 'display' | 'fullName' | 'name'
	>
): string => {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}

	const email = typeof contact.email === 'string' ? contact.email : undefined;
	const address = typeof contact.address === 'string' ? contact.address : undefined;

	return contact.fullName ?? email ?? contact.name ?? address ?? contact.display ?? '';
};

const Hint = ({ contact }: { contact: ContactInputItem }): ReactElement => {
	const label = getChipLabel(contact);
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			minWidth="16rem"
			minHeight="2rem"
		>
			<Avatar label={label} />
			<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
				{!isContactGroup(contact) ? (
					<>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text size="large">{label}</Text>
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text color="secondary">{contact.email}</Text>
						</Row>
					</>
				) : (
					<Text size="large">{label}</Text>
				)}
			</Container>
		</Container>
	);
};

interface SkeletonTileProps {
	width?: string;
	height?: string;
	radius?: string;
	theme: DefaultTheme;
}

const SkeletonTile = styled.div<SkeletonTileProps>`
	width: ${({ width }): string => width ?? '1rem'};
	max-width: ${({ width }): string => width ?? '1rem'};
	min-width: ${({ width }): string => width ?? '1rem'};
	height: ${({ height }): string => height ?? '1rem'};
	max-height: ${({ height }): string => height ?? '1rem'};
	min-height: ${({ height }): string => height ?? '1rem'};
	border-radius: ${({ radius }): string => radius ?? '0.125rem'};
	background: ${({ theme }): string => theme.palette.gray2.regular};
`;

const CustomChipInput = styled(ChipInput)`
	input {
		width: 100%;
	}
`;

const Loader = (): ReactElement => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<SkeletonTile radius="50%" width="2rem" height="2rem" />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<SkeletonTile
				radius="0.25rem"
				width={`${Math.random() * 9.375 + 4}rem`}
				height="0.875rem"
				style={{ marginBottom: '0.25rem' }}
			/>
			<SkeletonTile radius="0.25rem" width={`${Math.random() * 9.375 + 4}rem`} height="0.75rem" />
		</Container>
	</Container>
);

function tryToParseEmail(input: string | undefined): string {
	const inputOrDefault = unescape(input ?? '');
	return parseEmail(inputOrDefault) ?? inputOrDefault.trim();
}

export type ContactInputProps = Pick<
	ChipInputProps,
	| 'icon'
	| 'iconAction'
	| 'placeholder'
	| 'background'
	| 'iconDisabled'
	| 'description'
	| 'hasError'
	| 'inputRef'
> & {
	onChange?: ContactInputOnChange;
	defaultValue: Array<ContactInputItem>;
	dragAndDropEnabled?: boolean;
	orderedAccountIds?: Array<string>;
	chipDisplayName?: ContactInputChipDisplayName;
	contactActions?: Array<ContactChipAction>;
};

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
		email?: string;
		dragStartRef: HTMLInputElement | null;
	}>(emptyDraggedChip);
	const isSameElement = useRef(false);

	const buildDragStartHandler = useCallback(
		(chip) => (ev: React.DragEvent) => {
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
		(chip): ChipItem => ({
			...chip,
			draggable: true,
			onDragStart: buildDragStartHandler(chip)
		}),
		[buildDragStartHandler]
	);

	const editChip = useCallback(
		(text, id) => {
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
				const id = Date.now().toString();
				const chip: ContactInputItem = {
					id,
					label: valueToAdd,
					error: !isValidEmail(valueToAdd),
					actions: [
						{
							id: 'action1',
							label: isValidEmail(valueToAdd)
								? t('label.edit_email', 'Edit E-mail')
								: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
							icon: 'EditOutline',
							type: 'button',
							onClick: () => editChip(valueToAdd, id)
						}
					]
				};
				if (!isValidEmail(valueToAdd)) {
					chip.avatarIcon = 'AlertCircleOutline';
				}
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
					.then((autoCompleteResult) =>
						map<Match, Match>(autoCompleteResult.match, (m) => ({
							...m,
							email: isContactGroup(m) ? undefined : tryToParseEmail(m.email)
						}))
					)
					.then((remoteResults) => {
						const normRemoteResults = map(remoteResults, (result) => ({
							email: result.email,
							firstName: result.first,
							lastName: result.last,
							company: result.company,
							fullName: result.full,
							display: result.display,
							isGroup: result.isGroup,
							id: result.id,
							l: result.l,
							exp: result.exp,
							label: getChipLabel(result)
						}));
						setOptions(
							map(normRemoteResults, (contact) => ({
								label: contact?.label ?? getChipLabel(contact),
								value: {
									id: `${contact.id} ${contact.email}`,
									email: contact?.email,
									firstName: contact?.firstName,
									lastName: contact?.lastName,
									company: contact?.company,
									fullName: contact?.fullName,
									display: contact?.display,
									isGroup: contact?.isGroup,
									groupId: contact?.id,
									label: contact?.label ?? getChipLabel(contact)
								},
								customComponent: <Hint contact={contact} />,
								id: `${contact.id} ${contact.email}`
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
		[defaults, editChip, inputRef, onChange, options, orderedAccountIds, t]
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
		(valueToAdd) => {
			if (typeof valueToAdd === 'string') {
				const id = Date.now().toString();
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
						onClick: () => editChip(valueToAdd.email, valueToAdd.id)
					}
				]
			};
		},
		[editChip, t]
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
			<CustomChipInput
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
				className="carbonio-bypass-context-menu"
				{...rest}
			/>
		</Container>
	);
};

export const ContactInput = (props: ContactInputProps): ReactElement => (
	<StoreProvider>
		<ContactInputCore {...props} />
	</StoreProvider>
);
