/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	ButtonOld as Button,
	Container,
	IconButton,
	Input,
	Padding,
	Row,
	Select,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import {
	FOLDERS,
	ZIMBRA_STANDARD_COLORS,
	getBridgedFunctions,
	replaceHistory,
	report,
	t,
	useBoardHooks
} from '@zextras/carbonio-shell-ui';
import { filter, find, map, omit, reduce, set } from 'lodash';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FoldersSelector } from '../../carbonio-ui-commons/components/select/folders-selector';
import { CompactView } from '../../commons/contact-compact-view';
import { useAppSelector } from '../../hooks/redux';
import { createContact } from '../../store/actions/create-contact';
import { modifyContact } from '../../store/actions/modify-contact';
import { selectContact } from '../../store/selectors/contacts';
import { selectFolders } from '../../store/selectors/folders';
import { differenceObject } from '../settings/components/utils';
import reducer, { op } from './form-reducer';
import FormSection from './form-section';

const ItalicText = styled(Text)`
	font-style: italic;
	color: ${({ theme }) => theme.palette.gray1.regular};
	padding-right: 0.5rem;
`;

const filterEmptyValues = (values) =>
	reduce(
		values,
		(acc, v, k) =>
			filter(v, (field, key) => key !== 'name' && key !== 'type' && field !== '').length > 0
				? { ...acc, [k]: v }
				: acc,
		{}
	);

const cleanMultivalueFields = (contact) => ({
	...contact,
	address: filterEmptyValues(contact.address),
	email: filterEmptyValues(contact.email),
	phone: filterEmptyValues(contact.phone),
	URL: filterEmptyValues(contact.URL)
});

const ContactEditorRow = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);
const CustomStringField = ({ name, label, value, dispatch }) => (
	<Container padding={{ all: 'small' }}>
		<Input
			backgroundColor="gray5"
			inputName={name}
			label={label}
			defaultValue={value}
			onChange={(ev) => dispatch({ type: op.setInput, payload: ev.target })}
		/>
	</Container>
);

const capitalize = (lower) => lower.replace(/^\w/, (c) => c.toUpperCase());

const CustomMultivalueField = ({
	name,
	label,
	types,
	typeField,
	typeLabel,
	subFields,
	fieldLabels,
	wrap,
	value,
	dispatch
}) => {
	const typeCounts = useMemo(
		() =>
			reduce(
				types,
				(acc, type) => ({
					...acc,
					[type.value]: filter(value, (v) => v[typeLabel] === type.value).length
				}),
				{}
			),
		[value, typeLabel, types]
	);

	const emptyValue = useMemo(
		() =>
			reduce(
				subFields,
				(acc, val) => set(acc, val, ''),
				typeField ? { [typeField]: types[0].value } : {}
			),
		[subFields, typeField, types]
	);

	const generateNewTypedId = useCallback(
		(type) => {
			const substring = `${type}${capitalize(name)}`;
			const recursiveIdIncrement = (candidateId, increment) => {
				if (value[candidateId]) {
					return recursiveIdIncrement(`${substring}${increment}`, increment + 1);
				}
				return candidateId;
			};
			return recursiveIdIncrement(
				`${substring}${typeCounts[type] > 0 ? typeCounts[type] + 1 : ''}`,
				2
			);
		},
		[value, name, typeCounts]
	);

	const generateNewUntypedId = useCallback(() => {
		const recursiveIdIncrement = (candidateId, increment) => {
			if (value[candidateId] || candidateId === 'email1') {
				return recursiveIdIncrement(`${name}${increment}`, increment + 1);
			}
			return candidateId;
		};
		return recursiveIdIncrement(!value[name] ? name : name + 2, 1);
	}, [value, name]);

	const addValue = useCallback(() => {
		dispatch({
			type: op.setRowInput,
			payload: {
				...value,
				[types && types[0].value ? generateNewTypedId(types[0].value) : generateNewUntypedId()]:
					emptyValue
			},
			name
		});
	}, [dispatch, emptyValue, generateNewTypedId, generateNewUntypedId, name, types, value]);

	const removeValue = useCallback(
		(index) => {
			dispatch({
				type: op.setRowInput,
				payload: { ...omit(value, [index]) },
				name
			});
		},
		[dispatch, value, name]
	);

	const updateValue = useCallback(
		(newString, subField, id) => {
			if (newString === value[id][subField]) return;
			if (subField === typeField) {
				dispatch({
					type: op.setRowInput,
					payload: {
						...omit(value, [id]),
						[generateNewTypedId(newString)]: {
							...value[id],
							type: newString
						}
					},
					name
				});
			} else {
				dispatch({
					type: op.setRowInput,
					payload: {
						...value,
						[id]: { ...value[id], [subField]: newString }
					},
					name
				});
			}
		},
		[value, name, generateNewTypedId, dispatch, typeField]
	);

	useEffect(() => {
		if (Object.values(value).length === 0) {
			addValue();
		}
	}, [addValue, value]);

	return (
		<FormSection label={label}>
			{map(Object.entries(value), ([id, item], index) => (
				<ContactEditorRow wrap={wrap ? 'wrap' : 'nowrap'} key={`${label}${id}`}>
					{map(subFields, (subField, subIndex) => (
						<Padding
							right="small"
							top="small"
							key={`${fieldLabels[subIndex]}${id}`}
							style={{ width: wrap ? '32%' : '100%', flexGrow: 1 }}
						>
							<Input
								inputName={name}
								backgroundColor="gray5"
								label={fieldLabels[subIndex]}
								defaultValue={item[subField]}
								onChange={(ev) =>
									dispatch({
										type: op.setSelect,
										payload: { ev: ev.target, id, subField }
									})
								}
							/>
						</Padding>
					))}
					<Container
						style={{ flexGrow: 1, minWidth: typeField ? '12.5rem' : '6.5rem' }}
						width={typeField ? 'calc(32% + 0.5rem)' : '6.5rem'}
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ top: 'small', right: 'small' }}
					>
						<Padding right="small" style={{ width: 'calc(100% - 5.5rem)' }}>
							{typeField && typeLabel && types && types.length > 0 && (
								<Select
									items={types}
									label={typeLabel}
									onChange={(val) => updateValue(val, typeField, id)}
									defaultSelection={find(types, ['value', value[id][typeField]])}
								/>
							)}
						</Padding>
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							height="fit"
							width="5.5rem"
							style={{ minWidth: '5.5rem' }}
						>
							{index >= Object.entries(value).length - 1 ? (
								<>
									<Padding right="small">
										<IconButton
											icon="Plus"
											customSize={{
												iconSize: 'medium',
												paddingSize: 'medium'
											}}
											iconColor="gray6"
											backgroundColor="primary"
											onClick={() => addValue()}
										/>
									</Padding>
									<IconButton
										icon="Minus"
										iconColor="gray6"
										customSize={{
											iconSize: 'medium',
											paddingSize: 'medium'
										}}
										backgroundColor="secondary"
										onClick={() => removeValue(id)}
									/>
								</>
							) : (
								<IconButton
									icon="Minus"
									iconColor="gray6"
									backgroundColor="secondary"
									onClick={() => removeValue(id)}
								/>
							)}
						</Container>
					</Container>
				</ContactEditorRow>
			))}
		</FormSection>
	);
};

export default function EditView({ panel }) {
	const { folderId, editId } = useParams();
	const storeDispatch = useDispatch();
	const existingContact = useAppSelector((state) => selectContact(state, folderId, editId));
	const [contact, dispatch] = useReducer(reducer);
	const boardUtilities = useBoardHooks();
	const [compareToContact, setCompareToContact] = useState(existingContact);
	const [selectFolderId, setSelectFolderId] = useState(FOLDERS.CONTACTS);
	const keys = Object.keys(existingContact ?? {});

	useEffect(() => {
		if (!compareToContact && keys?.length > 0) setCompareToContact(existingContact);
		let canSet = true;
		if (editId && editId !== 'new' && existingContact) {
			canSet && dispatch({ type: op.setExistingContact, payload: { existingContact } });
			setSelectFolderId(existingContact.parent);
		}
		if (editId && editId === 'new') {
			canSet && dispatch({ type: op.setEmptyContact, payload: {} });
		}
		if (!panel) {
			canSet && dispatch({ type: op.setEmptyContact, payload: {} });
		}
		return () => {
			canSet = false;
		};
	}, [compareToContact, editId, existingContact, keys?.length, panel]);

	const fieldsToUpdate = useMemo(() => {
		if (!contact) {
			return {};
		}
		const updatedContact = cleanMultivalueFields(contact);

		return differenceObject(compareToContact, updatedContact);
	}, [compareToContact, contact]);

	const folders = useAppSelector(selectFolders);
	const selectedFolderName = useMemo(() => {
		const selectedFolder = find(folders, ['id', selectFolderId]);
		return selectFolderId === FOLDERS.CONTACTS
			? t('folders.contacts', 'Contacts')
			: selectedFolder.label;
	}, [folders, selectFolderId]);
	const folderWithWritePerm = useMemo(
		() =>
			filter(
				folders,
				(folder) =>
					(folder.id !== FOLDERS.TRASH && !folder.isShared) ||
					(folder.perm && folder.perm.indexOf('w') !== -1)
			),
		[folders]
	);
	const allFolders = useMemo(
		() =>
			map(folderWithWritePerm, (item) => ({
				label: item.id === FOLDERS.CONTACTS ? t('folders.contacts', 'Contacts') : item.label,
				value: item.id,
				color: ZIMBRA_STANDARD_COLORS[item.color || 0].hex
			})),
		[folderWithWritePerm]
	);

	const isDisabled = useMemo(() => {
		if (editId && editId !== 'new' && existingContact) {
			return Object.keys(fieldsToUpdate).length < 1 || !(contact?.firstName || contact?.lastName);
		}
		return !(contact?.firstName || contact?.lastName);
	}, [contact?.firstName, contact?.lastName, editId, existingContact, fieldsToUpdate]);
	const title = useMemo(
		() =>
			contact?.namePrefix ||
			contact?.firstName ||
			contact?.middleName ||
			contact?.nickName ||
			contact?.lastName ||
			contact?.nameSuffix
				? `${contact?.namePrefix ?? ''} ${contact?.firstName ?? ''} ${contact?.middleName ?? ''} ${
						contact?.nickName ?? ''
				  } ${contact?.lastName ?? ''} ${contact?.nameSuffix ?? ''}`
				: t('label.new_contact', 'New contact'),
		[
			contact?.firstName,
			contact?.lastName,
			contact?.middleName,
			contact?.namePrefix,
			contact?.nameSuffix,
			contact?.nickName
		]
	);

	useEffect(() => {
		if (!panel) {
			boardUtilities?.updateBoard({ title });
		}
	}, [panel, title, boardUtilities]);

	const onSubmit = useCallback(() => {
		const updatedContact = cleanMultivalueFields(contact);
		if (!updatedContact.id) {
			storeDispatch(createContact(updatedContact))
				.then((res) => {
					if (panel && !res.error) {
						replaceHistory(`/folder/${folderId}/contacts/${res.payload[0].id}`);
					} else if (res.type.includes('fulfilled')) {
						boardUtilities?.closeBoard();
						getBridgedFunctions().createSnackbar({
							key: `edit`,
							replace: true,
							type: 'success',
							label: t('label.new_contact_created', 'New contact created'),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				})
				.catch(report);
		} else {
			storeDispatch(
				modifyContact({
					updatedContact,
					existingContact
				})
			)
				.then((res) => {
					if (panel) {
						replaceHistory(`/folder/${folderId}/contacts/${res.payload[0].id}`);
					}
				})
				.catch(report);
		}
	}, [boardUtilities, contact, existingContact, folderId, panel, storeDispatch]);

	const defaultTypes = useMemo(
		() => [
			{ label: t('types.work', 'work'), value: 'work' },
			{ label: t('types.home', 'home'), value: 'home' },
			{ label: t('types.other', 'other'), value: 'other' }
		],
		[]
	);

	const mobileTypes = useMemo(
		() => [
			{ label: t('types.mobile', 'mobile'), value: 'mobile' },
			{ label: t('types.work', 'work'), value: 'work' },
			{ label: t('types.home', 'home'), value: 'home' },
			{ label: t('types.other', 'other'), value: 'other' }
		],
		[]
	);

	return contact ? (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			background="gray6"
			height="fill"
		>
			<Container
				padding={{ all: 'medium' }}
				height="fit"
				crossAlignment="flex-start"
				background="gray6"
				data-testid="EditContact"
			>
				<Row orientation="horizontal" mainAlignment="space-between" width="fill">
					<Container height="fit" width="fit">
						{!editId && (
							<ItalicText>
								{t('label.contact_created_in_folder', {
									name: selectedFolderName,
									defaultValue: 'This contact will be created in the "{{name}}" folder'
								})}
							</ItalicText>
						)}
					</Container>
					<Tooltip
						label={t('message.require_field', 'Fill one required * field')}
						placement="top"
						disabled={!isDisabled}
					>
						<Button label={t('label.save', 'Save')} onClick={onSubmit} disabled={isDisabled} />
					</Tooltip>
				</Row>
				<Padding value="medium small">
					<CompactView contact={contact} />
				</Padding>
				<ContactEditorRow>
					<CustomStringField
						name="namePrefix"
						label={t('name.prefix', 'Prefix')}
						value={contact.namePrefix}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="firstName"
						label={`${t('name.first_name', 'First Name')}*`}
						value={contact.firstName}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="middleName"
						label={t('name.middle_name', 'Middle Name')}
						value={contact.middleName}
						dispatch={dispatch}
					/>
				</ContactEditorRow>
				<ContactEditorRow>
					<CustomStringField
						name="nickName"
						label={t('name.nickName', 'Nickname')}
						value={contact.nickName}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="lastName"
						label={`${t('name.last_name', 'Last Name')}*`}
						value={contact.lastName}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="nameSuffix"
						label={t('name.suffix', 'Suffix')}
						value={contact.nameSuffix}
						dispatch={dispatch}
					/>
				</ContactEditorRow>
				<ContactEditorRow>
					<CustomStringField
						name="jobTitle"
						label={t('job.title', 'Job Role')}
						value={contact.jobTitle}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="department"
						label={t('job.department', 'Department')}
						value={contact.department}
						dispatch={dispatch}
					/>
					<CustomStringField
						name="company"
						label={t('job.company', 'Company')}
						value={contact.company}
						dispatch={dispatch}
					/>
				</ContactEditorRow>
				<ContactEditorRow>
					<CustomStringField
						name="notes"
						label={t('label.notes', 'Notes')}
						value={contact.notes}
						dispatch={dispatch}
					/>
				</ContactEditorRow>
				{!editId && (
					<ContactEditorRow>
						<Padding horizontal="small" top="small" style={{ width: '100%' }}>
							<Row padding={{ bottom: 'small' }} crossAlignment="flex-start" orientation="vertical">
								<Text size="large" weight={'medium'} overflow="break-word">
									{t('label.destination_address_book', 'Destination address book')}
								</Text>
							</Row>
							<FoldersSelector
								defaultFolderId={selectFolderId}
								onChange={(selectedItem) => {
									dispatch({
										type: op.setInput,
										payload: { name: 'parent', value: selectedItem }
									});
									setSelectFolderId(selectedItem);
								}}
								label={t('share.contact_folder', 'Address Book')}
								folderItems={allFolders}
								disabled={false}
							></FoldersSelector>
						</Padding>
					</ContactEditorRow>
				)}
				<CustomMultivalueField
					name="email"
					label={t('section.title.mail', 'E-mail address')}
					subFields={['mail']}
					fieldLabels={[t('label.email', 'E-mail')]}
					value={contact.email}
					dispatch={dispatch}
				/>
				<CustomMultivalueField
					name="phone"
					label={t('section.title.phone_number', 'Phone contact')}
					typeLabel={t('select.default', 'Select type')}
					typeField="type"
					types={mobileTypes}
					subFields={['number']}
					fieldLabels={[t('section.field.number', 'Number')]}
					value={contact.phone}
					dispatch={dispatch}
				/>
				<CustomMultivalueField
					name="URL"
					label={t('label.website')}
					typeLabel={t('select.default', 'Select type')}
					typeField="type"
					types={defaultTypes}
					subFields={['url']}
					fieldLabels={[t('label.website', 'Website')]}
					value={contact.URL}
					dispatch={dispatch}
				/>
				<CustomMultivalueField
					name="address"
					label={t('section.title.address', 'Address')}
					typeField="type"
					typeLabel={t('select.default', 'Select type')}
					types={defaultTypes}
					subFields={['street', 'city', 'postalCode', 'country', 'state']}
					fieldLabels={[
						t('section.field.street', 'Street'),
						t('section.field.city', 'City'),
						t('section.field.postalCode', 'PostalCode'),
						t('section.field.country', 'Country'),
						t('section.field.state', 'State')
					]}
					wrap
					value={contact.address}
					dispatch={dispatch}
				/>
			</Container>
		</Container>
	) : null;
}
