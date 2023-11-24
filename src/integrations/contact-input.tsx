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
	ChipItem
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
	noop
} from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import styled, { DefaultTheme } from 'styled-components';

import { useAppSelector } from '../hooks/redux';
import { StoreProvider } from '../store/redux';
import { Contact, Group } from '../types/contact';
import { ContactsSlice, State } from '../types/store';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/[^\s@]+@[^\s@]+\.[^\s@]+/;

function isGroup(contact: Contact | Group): contact is Group {
	return (
		(contact as Group).isGroup &&
		(contact as Group).display !== undefined &&
		(contact as Group).display !== null
	);
}

const getChipLabel = (contact: any): string => {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}
	return contact.fullName ?? contact.email ?? contact.name ?? contact.address ?? '';
};

const Hint = ({ contact }: { contact: Contact | Group }): ReactElement => {
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
				{!isGroup(contact) ? (
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

export type ContactInputProps = {
	onChange?: (items: ChipItem<string | Contact>[]) => void;
	defaultValue: Array<Contact>;
	placeholder: string;
	background?: keyof DefaultTheme['palette'];
	dragAndDropEnabled?: boolean;
};

export const ContactInput: FC<ContactInputProps> = ({
	onChange,
	defaultValue,
	placeholder,
	background = 'gray5',
	dragAndDropEnabled = false,
	...props
}): ReactElement => {
	const [defaults, setDefaults] = useState<
		Array<ChipItem<string | Contact | ((prevState: ChipItem<string | Contact>[]) => ChipItem[])>>
	>([]);

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
	const onInputType = useCallback(
		(e) => {
			if (e.keyCode && e.keyCode === 13) {
				if (inputRef?.current) {
					inputRef.current.innerText = inputRef.current.innerText.replaceAll('\n', '');
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
				new Promise((resolve, reject) => {
					try {
						resolve(
							filter(allContacts, (c) =>
								some([c.firstName, c.lastName, c.company, c.email], (field) =>
									startsWith(field?.toString().toLowerCase().trim(), e.textContent?.toLowerCase())
								)
							)
						);
					} catch (err: any) {
						reject(new Error(err));
					}
				})
					.then((localResults: any) => {
						if (localResults.length > 0) {
							setOptions(localResults);
						}
						soapFetch('AutoComplete', {
							_jsns: 'urn:zimbraMail',
							includeGal: 1,
							name: e.textContent
						})
							.then((autoCompleteResult: any) =>
								map(autoCompleteResult.match, (m) => ({
									...m,
									isGroup: isGroup(m),
									email: isGroup(m) ? m.display : emailRegex.exec(m.email)?.[0]?.slice(1, -1)
								}))
							)
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
													startsWith(field?.toLowerCase().trim(), e.textContent.toLowerCase())
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
												isGroup: contact?.isGroup,
												groupId: contact?.id,
												label: contact?.label ?? getChipLabel(contact)
											},
											customComponent: <Hint contact={contact} />
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
		[allContacts, defaults, editChip, isValidEmail, onChange, options, t]
	);

	useEffect(() => {
		const groups = filter(defaults, ['isGroup', true]);
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

					setDefaults(() => {
						const newValue = reject(defaults, ['isGroup', true]);
						onChange && onChange([...newValue, ...newContacts]);
						return [...newValue, ...newContacts];
					});
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
			return valueToAdd;
		},
		[editChip, isValidEmail, t]
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
			onChange && onChange(newDefaults as ChipItem<string | Contact>[]);
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
		<StoreProvider>
			<Container width="100%" onDrop={onDrop} height="100%">
				<ChipInput
					disableOptions
					placeholder={placeholder}
					confirmChipOnBlur
					confirmChipOnSpace={false}
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
					separators={['NumpadEnter', ',']}
					onDragEnter={dragAndDropEnabled ? onDragEnter : noop}
					onDragOver={dragAndDropEnabled ? onDragEnter : noop}
					onDragEnd={dragAndDropEnabled ? onDragEnd : noop}
					{...props}
				/>
			</Container>
		</StoreProvider>
	);
};
