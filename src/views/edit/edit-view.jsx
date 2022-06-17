/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	replaceHistory,
	useRemoveCurrentBoard,
	report,
	getBridgedFunctions,
	useUpdateCurrentBoard
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { map, filter, reduce, set, omit, find } from 'lodash';
import {
	ButtonOld as Button,
	Container,
	Input,
	Row,
	IconButton,
	Padding,
	Text,
	Select
} from '@zextras/carbonio-design-system';
import { useDispatch, useSelector } from 'react-redux';
import FormSection from './form-section';
import { CompactView } from '../../commons/contact-compact-view';
import reducer, { op } from './form-reducer';
import { modifyContact } from '../../store/actions/modify-contact';
import { createContact } from '../../store/actions/create-contact';
import { selectContact } from '../../store/selectors/contacts';
import { differenceObject } from '../settings/components/utils';

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
						style={{ flexGrow: 1, minWidth: typeField ? '200px' : '104px' }}
						width={typeField ? 'calc(32% + 8px)' : '104px'}
						orientation="horizontal"
						mainAlignment="space-between"
						crossAlignment="flex-start"
						padding={{ top: 'small', right: 'small' }}
					>
						<Padding right="small" style={{ width: 'calc(100% - 88px)' }}>
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
							width="88px"
							style={{ minWidth: '88px' }}
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
	const existingContact = useSelector((state) => selectContact(state, folderId, editId));
	const [contact, dispatch] = useReducer(reducer);
	const [t] = useTranslation();
	const closeBoard = useRemoveCurrentBoard();
	const [compareToContact, setCompareToContact] = useState(existingContact);
	const keys = Object.keys(existingContact ?? {});
	const updateBoard = useUpdateCurrentBoard();

	useEffect(() => {
		if (!compareToContact && keys?.length > 0) setCompareToContact(existingContact);
		let canSet = true;
		if (editId && editId !== 'new' && existingContact) {
			canSet && dispatch({ type: op.setExistingContact, payload: { existingContact } });
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
			contact?.nickName,
			t
		]
	);

	useEffect(() => {
		if (!panel) {
			updateBoard(undefined, title);
		}
	}, [panel, title, updateBoard]);

	const onSubmit = useCallback(() => {
		const updatedContact = cleanMultivalueFields(contact);
		if (!updatedContact.id) {
			storeDispatch(createContact(updatedContact))
				.then((res) => {
					if (panel && !res.error) {
						replaceHistory(`/folder/${folderId}/contacts/${res.payload[0].id}`);
					} else if (res.type.includes('fulfilled')) {
						closeBoard();
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
	}, [contact, closeBoard, folderId, panel, storeDispatch, t, existingContact]);

	const defaultTypes = useMemo(
		() => [
			{ label: t('types.work', 'work'), value: 'work' },
			{ label: t('types.home', 'home'), value: 'home' },
			{ label: t('types.other', 'other'), value: 'other' }
		],
		[t]
	);

	const mobileTypes = useMemo(
		() => [
			{ label: t('types.mobile', 'mobile'), value: 'mobile' },
			{ label: t('types.work', 'work'), value: 'work' },
			{ label: t('types.home', 'home'), value: 'home' },
			{ label: t('types.other', 'other'), value: 'other' }
		],
		[t]
	);

	const fieldsToUpdate = useMemo(() => {
		if (!contact) {
			return {};
		}
		const updatedContact = cleanMultivalueFields(contact);

		return differenceObject(compareToContact, updatedContact);
	}, [compareToContact, contact]);

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
							<Text>
								{t('message.new_contact', "This contact will be created in the 'Contacts' folder")}
							</Text>
						)}
					</Container>
					<Button
						label={t('label.save', 'Save')}
						onClick={onSubmit}
						disabled={editId ? Object.keys(fieldsToUpdate).length < 1 : false}
					/>
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
						label={t('name.first_name', 'First Name')}
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
						label={t('name.last_name', 'Last Name')}
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
				<ContactEditorRow>
					<CustomStringField
						name="notes"
						label={t('label.notes', 'Notes')}
						value={contact.notes}
						dispatch={dispatch}
					/>
				</ContactEditorRow>
			</Container>
		</Container>
	) : null;
}
