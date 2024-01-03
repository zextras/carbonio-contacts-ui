/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef, useState, ReactElement, FC, useMemo } from 'react';

import { createSelector } from '@reduxjs/toolkit';
import {
	Avatar,
	ChipInput,
	Container,
	Row,
	Text,
	ChipProps,
	ChipItem,
	ChipInputProps,
	ChipAction
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import {
	filter,
	find,
	findIndex,
	map,
	reduce,
	some,
	startsWith,
	trim,
	forEach,
	reject,
	uniqBy,
	omit,
	noop
} from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled, { DefaultTheme } from 'styled-components';

import { ContactInputCustomChipComponent } from './contact-input-custom-chip-component';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { DistributionList } from '../../model/distribution-list';
import { parseFullAutocompleteXML } from '../helpers/autocomplete';
import { useAppSelector } from '../hooks/redux';
import { StoreProvider } from '../store/redux';
import { Contact, Group } from '../types/contact';
import {
	ContactInputChipDisplayName,
	ContactInputOnChange,
	ContactInputValue,
	CustomChipProps
} from '../types/integrations';
import { ContactsSlice, State } from '../types/store';

const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;

function isContactGroup(contact: {
	isGroup?: boolean;
	display?: string | undefined | null;
	email?: string | undefined;
}): boolean {
	return (
		(contact?.isGroup &&
			contact?.display !== undefined &&
			contact?.display !== null &&
			!contact?.email) ??
		false
	);
}

const getChipLabel = (contact: any): string => {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}
	return (
		contact.fullName ?? contact.email ?? contact.name ?? contact.address ?? contact.display ?? ''
	);
};

const Hint = ({ contact }: { contact: Group }): ReactElement => {
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

export type ContactInputItem = { email: string; isGroup?: boolean } & Partial<
	Omit<Contact, 'email'>
>;

export type ContactChipAction = Omit<ChipAction, 'onClick'> & {
	isVisible: (chipItem: ContactInputItem | DistributionList) => boolean;
	onClick: (chipItem: ContactInputItem | DistributionList) => void;
};

export type ContactInputProps = Pick<
	ChipInputProps,
	'icon' | 'iconAction' | 'placeholder' | 'background' | 'iconDisabled' | 'description' | 'hasError'
> & {
	onChange?: ContactInputOnChange;
	defaultValue: Array<Contact>;
	dragAndDropEnabled?: boolean;
	extraAccountsIds: Array<string>;
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
	extraAccountsIds,
	contactActions,
	...rest
}) => {
	const props = omit(rest, 'ChipComponent');
	const [defaults, setDefaults] = useState<ContactInputValue>([]);
	const [options, setOptions] = useState<any>([]);
	const [idToRemove, setIdToRemove] = useState('');
	const [t] = useTranslation();
	const inputRef = useRef<HTMLInputElement | null>(null);
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
		[]
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

	const allContacts: Array<Contact> = useAppSelector(
		createSelector(
			(state: State) => state.contacts.contacts,
			(contacts: ContactsSlice['contacts']) =>
				reduce(
					contacts,
					(acc: Array<Contact>, folderContacts) =>
						folderContacts
							? [
									...acc,
									...reduce(
										folderContacts,
										(acc2: any, contact) => [
											...acc2,
											...map(contact.email, (email) => ({
												...contact,
												email: email.mail,
												picture: contact.image
											}))
										],
										[]
									)
							  ]
							: acc,
					[]
				)
		)
	);

	const isValidEmail = useCallback((email) => emailRegex.test(email), []);

	const editChip = useCallback((text, id) => {
		setIdToRemove(id);
		if (inputRef?.current) {
			inputRef.current.value = text;
			inputRef.current.style.width = inputRef.current.value
				? `${inputRef.current.scrollWidth}px`
				: '';
		}
	}, []);
	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		(e) => {
			if (e.key === 'Enter') {
				if (inputRef?.current) {
					// FIXME: innerText does not contain new line chars at this point
					inputRef.current.innerText = inputRef.current.innerText?.replaceAll('\n', '');
				}
				if (options?.length > 0 && !find(options, { id: 'loading' })) {
					onChange &&
						onChange([
							...defaults,
							{
								...(options[0]?.value as Contact)
							}
						] as ChipItem<string | Contact>[]);
					if (inputRef?.current) {
						inputRef.current.innerText = '';
					}
					setOptions([]);
					return;
				}
				const valueToAdd = inputRef?.current?.innerText.replaceAll('\n', '');
				const id = moment().valueOf().toString();
				const chip: ChipProps = {
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
					onChange && onChange([...defaults, { ...chip }] as ChipItem<string | Contact>[]);
				}
				if (inputRef?.current) {
					inputRef.current.innerText = '';
				}
				return;
			}
			if (e.textContent && e.textContent !== '') {
				setOptions([
					{
						id: 'loading',
						label: 'loading',
						customComponent: <Loader />
					}
				]);
				new Promise((resolve, promiseReject) => {
					try {
						resolve(
							filter(allContacts, (c) =>
								some([c.firstName, c.lastName, c.company, c.email], (field) =>
									startsWith(field?.toString().toLowerCase().trim(), e.textContent?.toLowerCase())
								)
							)
						);
					} catch (err: any) {
						promiseReject(new Error(err));
					}
				})
					.then((localResults: any) => {
						if (localResults.length > 0) {
							setOptions(localResults);
						}
						soapFetch('FullAutocomplete', {
							...(extraAccountsIds?.length > 0 && {
								extraAccountId: extraAccountsIds.map((id) => ({ _content: id }))
							}),
							AutoCompleteRequest: {
								name: e.textContent,
								includeGal: 1
							},
							_jsns: 'urn:zimbraMail'
						})
							.then((autoCompleteResult: any) => {
								const results = parseFullAutocompleteXML(autoCompleteResult);
								return map(results.match, (m) => ({
									...m,
									email: isContactGroup(m)
										? undefined
										: emailRegex.exec(m.email ?? '')?.[0]?.slice(1, -1)
								}));
							})
							.then((remoteResults: any) => {
								const normRemoteResults = reduce(
									remoteResults,
									(acc, result: any) => {
										const localIndex = findIndex(acc, ['email', result.email]);
										if (localIndex >= 0) {
											return acc;
										}
										return [
											...acc,
											{
												email: result.email,
												firstName: result.first,
												lastName: result.last,
												company: result.company,
												fullName: result.full,
												display: result.display,
												isGroup: result.isGroup,
												id: result.id,
												l: result.l,
												exp: result.exp
											}
										];
									},
									localResults
								);
								setOptions(
									map(
										filter(normRemoteResults, (c: any) =>
											some(
												// eslint-disable-next-line max-len
												[c?.firstName, c?.lastName, c?.company, c?.email, c?.fullName, c?.display],
												(field: any) =>
													// eslint-disable-next-line max-len
													startsWith(field?.toLowerCase().trim(), e.textContent?.toLowerCase())
											)
										),
										(contact: any) => ({
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
										})
									)
								);
							})
							.catch(() => {
								setOptions([]);
							});
					})
					.catch(() => {
						setOptions([]);
					});
			} else setOptions([]);
		},
		[allContacts, defaults, editChip, extraAccountsIds, isValidEmail, onChange, options, t]
	);

	useEffect(() => {
		const groups = filter(defaults, (def) => isContactGroup(def));
		const newContacts: any = [];
		if (groups.length > 0) {
			forEach(groups, (def: any) => {
				soapFetch('GetContacts', {
					_jsns: 'urn:zimbraMail',
					cn: {
						id: def.groupId
					},
					derefGroupMember: true
				}).then((result: any) => {
					const id = moment().valueOf().toString();
					const members = result && result?.cn && result?.cn[0].m;
					forEach(members, (member) => {
						const email = member.cn?.[0]._attrs.email ?? member.value;
						newContacts.push({
							email,
							id,
							label: email,
							error: !isValidEmail(email),
							draggable: true,
							onDragStart: buildDragStartHandler({ id, email, label: email })
						});
					});
					const newValue = reject(defaults, (chip) => isContactGroup(chip));
					const updatedValue = [...newValue, ...newContacts];
					onChange && onChange(updatedValue);
					setDefaults(updatedValue);
				});
			});
		}
	}, [buildDragStartHandler, defaults, isValidEmail, onChange]);

	const contactInputValue = useMemo(() => uniqBy(defaults, 'email'), [defaults]);

	const onAdd = useCallback(
		(valueToAdd) => {
			if (typeof valueToAdd === 'string') {
				const id = moment().valueOf().toString();
				const chip: any = {
					email: valueToAdd,
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
		[editChip, isValidEmail, t]
	);

	const ChipComponent = useCallback(
		(_props: CustomChipProps): React.JSX.Element => (
			<ContactInputCustomChipComponent
				{..._props}
				contactActions={contactActions}
				chipDisplayName={chipDisplayName}
				contactInputOnChange={onChange}
				contactInputValue={contactInputValue}
			/>
		),
		[chipDisplayName, contactActions, contactInputValue, onChange]
	);

	const onDragEnter = useCallback((ev) => {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move';
	}, []);

	const resetDraggedChip = useCallback(() => {
		draggedChip.current = emptyDraggedChip;
	}, [emptyDraggedChip]);

	const onDragEnd = useCallback(
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
			const newDefaults = filter(defaults, (c: any) => {
				if (c.email) return c.email !== draggedChip.current.email;

				return c.id !== draggedChip.current.id;
			});
			onChange && onChange(newDefaults);
			resetDraggedChip();
			isSameElement.current = false;
		},
		[defaults, onChange, resetDraggedChip]
	);

	const onDrop = useCallback(
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
				const newChip = buildDraggableChip(chip) as ChipItem<string | Contact>;
				setDefaults((prevState) =>
					find(prevState, { id: newChip.id }) ? prevState : { ...prevState, newChip }
				);
				onChange && onChange([...defaults, { ...newChip }] as ChipItem<string | Contact>[]);
				resetDraggedChip();
				isSameElement.current = false;
			}
		},
		[buildDraggableChip, defaults, onChange, resetDraggedChip]
	);

	return (
		<Container width="100%" onDrop={onDrop} height="100%">
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
				onAdd={onAdd}
				requireUniqueChips
				createChipOnPaste
				pasteSeparators={[',', ' ', ';', '\n']}
				separators={[
					{ code: 'NumpadEnter', ctrlKey: false },
					{ key: ',', ctrlKey: false }
				]}
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				ChipComponent={ChipComponent}
				onDragEnter={dragAndDropEnabled ? onDragEnter : noop}
				onDragOver={dragAndDropEnabled ? onDragEnter : noop}
				onDragEnd={dragAndDropEnabled ? onDragEnd : noop}
				{...props}
			/>
		</Container>
	);
};

export const ContactInput = (props: ContactInputProps): ReactElement => (
	<StoreProvider>
		<ContactInputCore {...props} />
	</StoreProvider>
);
