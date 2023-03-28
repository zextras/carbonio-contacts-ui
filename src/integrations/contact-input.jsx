/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSelector } from '@reduxjs/toolkit';
import {
	Avatar,
	Chip,
	ChipInput,
	Container,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { filter, find, findIndex, map, reduce, some, startsWith, trim } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppSelector } from '../hooks/redux';
import { StoreProvider } from '../store/redux';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/[^\s@]+@[^\s@]+\.[^\s@]+/;

const getChipLabel = (contact) => {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}
	return contact.fullName ?? contact.email ?? contact.name ?? contact.address ?? '';
};

const Hint = ({ contact }) => {
	const label = useMemo(() => contact.label ?? getChipLabel(contact), [contact]);
	return (
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="center"
			minWidth="16rem"
			minHeight="2rem"
		>
			<Avatar label={contact.label ?? getChipLabel(contact)} />
			<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
				{label !== contact.email ? (
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

const SkeletonTile = styled.div`
	width: ${({ width }) => width ?? '1rem'};
	max-width: ${({ width }) => width ?? '1rem'};
	min-width: ${({ width }) => width ?? '1rem'};
	height: ${({ height }) => height ?? '1rem'};
	max-height: ${({ height }) => height ?? '1rem'};
	min-height: ${({ height }) => height ?? '1rem'};
	border-radius: ${({ radius }) => radius ?? '0.125rem'};
	background: ${({ theme }) => theme.palette.gray2.regular};
`;

const Loader = () => (
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

function ContactInput({ onChange, defaultValue, placeholder, background = 'gray5', ...props }) {
	const [defaults, setDefaults] = useState([]);
	const [options, setOptions] = useState([]);
	const [idToRemove, setIdToRemove] = useState('');
	const [t] = useTranslation();
	const inputRef = useRef();

	useEffect(() => {
		setDefaults(
			map(filter(defaultValue, (c) => c.id !== idToRemove) ?? [], (obj) => ({
				...obj,
				label: obj.label ?? getChipLabel(obj)
			}))
		);
	}, [defaultValue, idToRemove]);

	const allContacts = useAppSelector(
		createSelector(
			(state) => state.contacts.contacts,
			(contacts) =>
				reduce(
					contacts,
					(acc, folderContacts) =>
						folderContacts
							? [
									...acc,
									...reduce(
										folderContacts,
										(acc2, contact) => [
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
			inputRef.current.innerText = text;
		}
	}, []);
	const onInputType = useCallback(
		(e) => {
			if (e.keyCode && e.keyCode === 13) {
				if (inputRef?.current) {
					inputRef.current.innerText = inputRef.current.innerText.replaceAll('\n', '');
				}
				if (options.length > 0 && !find(options, { id: 'loading' })) {
					onChange([...defaults, { ...options[0]?.value }]);
					if (inputRef?.current) {
						inputRef.current.innerText = '';
					}
					setOptions([]);
					return;
				}
				const valueToAdd = inputRef.current.innerText.replaceAll('\n', '');
				const id = moment().valueOf();
				const chip = {
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
				if (valueToAdd !== '') {
					onChange([...defaults, { ...chip }]);
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
					} catch (err) {
						reject(new Error(err));
					}
				})
					.then((localResults) => {
						if (localResults.length > 0) {
							setOptions(localResults);
						}
						soapFetch('AutoComplete', {
							_jsns: 'urn:zimbraMail',
							includeGal: 1,
							name: e.textContent
						})
							.then(({ match }) =>
								map(match, (m) => ({
									...m,
									email: emailRegex.exec(m.email)[0]?.slice(1, -1)
								}))
							)
							.then((remoteResults) => {
								const normRemoteResults = reduce(
									remoteResults,
									(acc, result) => {
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
												fullName: result.full
											}
										];
									},
									localResults
								);
								setOptions(
									map(
										filter(normRemoteResults, (c) =>
											some([c.firstName, c.lastName, c.company, c.email, c.fullName], (field) =>
												startsWith(field?.toLowerCase().trim(), e.textContent.toLowerCase())
											)
										),
										(contact) => ({
											label: contact.label ?? getChipLabel(contact),
											value: {
												id: `${contact.id} ${contact.email}`,
												email: contact?.email,
												firstName: contact.firstName,
												lastName: contact.lastName,
												company: contact.company,
												fullName: contact.fullName,
												label: contact.label ?? getChipLabel(contact)
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

	const onAdd = useCallback(
		(valueToAdd) => {
			if (typeof valueToAdd === 'string') {
				const id = moment().valueOf();
				const chip = {
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

	const customChip = (chipProps) => (
		<Chip
			{...chipProps}
			avatarLabel={chipProps.label}
			label={
				<Tooltip label={chipProps.email ?? chipProps.address} maxWidth="unset">
					<Row wrap="nowrap">
						<Text size="extrasmall">{chipProps.label}</Text>
					</Row>
				</Tooltip>
			}
		/>
	);

	return (
		<Container width="100%">
			<ChipInput
				disableOptions
				placeholder={placeholder}
				confirmChipOnBlur
				confirmChipOnSpace={false}
				inputRef={inputRef}
				onInputType={onInputType}
				onChange={onChange}
				options={options}
				value={defaults}
				background={background}
				onAdd={onAdd}
				requireUniqueChips
				createChipOnPaste
				ChipComponent={customChip}
				pasteSeparators={[',', ' ', ';', '\n']}
				separators={['NumpadEnter', ',']}
				{...props}
			/>
		</Container>
	);
}

const ContactInputComp = (props) => (
	<StoreProvider>
		<ContactInput {...props} />
	</StoreProvider>
);

export default ContactInputComp;
