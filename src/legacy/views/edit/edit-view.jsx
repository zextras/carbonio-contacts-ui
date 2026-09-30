/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import styled from '@emotion/styled';
import {
	Button,
	Container,
	Input,
	Padding,
	Row,
	Select,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { report } from '@zextras/carbonio-shell-ui';
import {
	FoldersSelector,
	FOLDERS,
	ZIMBRA_STANDARD_COLORS,
	isRoot,
	isSharedAccountFolder,
	isTrash,
	useFoldersMap
} from '@zextras/carbonio-ui-commons';
import { filter, find, map, reduce, trim } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { CompactView } from 'legacy/commons/contact-compact-view';
import { createContact } from 'legacy/store/actions/create-contact';
import { modifyContact } from 'legacy/store/actions/modify-contact';
import { addContactsToStore, useContactById } from 'legacy/store/contacts';
import { composeFileAsDescription, FILE_AS_FREE_TEXT } from 'legacy/utils/file-as';
import { getFolderTranslatedName } from 'legacy/utils/helpers';
import { normalizeContactsFromSoap } from 'legacy/utils/normalizations/normalize-contact-from-soap';
import { ContactEditorRow, CustomMultivalueField } from 'legacy/views/edit/CustomMultivalueField';
import reducer, { op } from 'legacy/views/edit/form-reducer';
import FormSection from 'legacy/views/edit/form-section';
import { differenceObject } from 'legacy/views/settings/components/utils';

const CustomText = styled(Text)`
	padding-right: 0.5rem;
`;

// Reserves the description/error line's height at all times, so no field ever grows
// taller than its siblings and shifts the row's vertical rhythm around.
const RESERVED_DESCRIPTION_SPACE = ' ';

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

const CustomStringField = ({
	name,
	label,
	value,
	dispatch,
	autoFocus = false,
	disabled = false,
	hasError = false,
	description = RESERVED_DESCRIPTION_SPACE,
	onBlur,
	onFocus,
	onChange,
	hidden = false,
	inputRef
}) => (
	<Container
		padding={{ all: 'small' }}
		crossAlignment="flex-start"
		height={'fit'}
		style={{ visibility: hidden ? 'hidden' : 'visible' }}
	>
		<Input
			background="gray5"
			inputName={name}
			label={label}
			defaultValue={value}
			onChange={(ev) => {
				dispatch({ type: op.setInput, payload: ev.target });
				onChange?.(ev);
			}}
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={autoFocus}
			disabled={disabled}
			hasError={hasError}
			description={description}
			onBlur={onBlur}
			onFocus={onFocus}
			inputRef={inputRef}
		/>
	</Container>
);

/** @type { (props: { panel?: boolean; onClose?: () => void; onTitleChanged?: (title: string) => void }) => React.JSX.Element } */
export default function EditView({ panel, onClose, onTitleChanged }) {
	const { folderId, editId } = useParams();
	const navigate = useNavigate();
	const existingContact = useContactById(editId);
	const [contact, dispatch] = useReducer(reducer);
	const [compareToContact, setCompareToContact] = useState(existingContact);
	const [selectFolderId, setSelectFolderId] = useState(FOLDERS.CONTACTS);
	const [showNameError, setShowNameError] = useState(false);
	const [showCustomFileAsError, setShowCustomFileAsError] = useState(false);
	const keys = Object.keys(existingContact ?? {});
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

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

	// Surfaces validation errors as soon as the form is first rendered, instead of
	// waiting for the user to interact with the offending field first.
	const hasInitializedValidation = useRef(false);
	useEffect(() => {
		if (hasInitializedValidation.current || !contact) return;
		hasInitializedValidation.current = true;
		setShowNameError(!trim(contact.firstName) && !trim(contact.lastName));
		setShowCustomFileAsError(contact.fileAs === FILE_AS_FREE_TEXT && !trim(contact.fileAsFreeText));
	}, [contact]);

	const fieldsToUpdate = useMemo(() => {
		if (!contact) {
			return {};
		}
		const updatedContact = cleanMultivalueFields(contact);

		return differenceObject(compareToContact, updatedContact);
	}, [compareToContact, contact]);

	const folders = useFoldersMap();

	const selectedFolderName = useMemo(() => {
		const selectedFolder = find(folders, ['id', selectFolderId]);
		return getFolderTranslatedName(t, selectFolderId, selectedFolder.name);
	}, [folders, selectFolderId, t]);
	const folderWithWritePerm = useMemo(
		() =>
			filter(
				folders,
				(folder) =>
					!isTrash(folder.id) &&
					!isRoot(folder.id) &&
					!isSharedAccountFolder(folder.id) &&
					(!folder.isLink || (folder.perm && folder.perm.indexOf('w') !== -1))
			),
		[folders]
	);
	const allFolders = useMemo(
		() =>
			map(folderWithWritePerm, (item) => ({
				label: getFolderTranslatedName(t, item.id, item.name),
				value: item.id,
				color: ZIMBRA_STANDARD_COLORS[item.color || 0].hex
			})),
		[folderWithWritePerm, t]
	);

	const isCustomFileAsEmpty = useMemo(
		() => contact?.fileAs === FILE_AS_FREE_TEXT && !trim(contact?.fileAsFreeText),
		[contact?.fileAs, contact?.fileAsFreeText]
	);

	const isNameMissing = useMemo(
		() => !trim(contact?.firstName) && !trim(contact?.lastName),
		[contact?.firstName, contact?.lastName]
	);

	// Focusing a field never hides an existing error, and only reveals one that
	// already applies to the field's current (committed) value.
	const onNameFieldFocus = useCallback(() => {
		if (isNameMissing) {
			setShowNameError(true);
		}
	}, [isNameMissing]);
	// Suppresses the reveal-on-focus behavior for the focus event fired by the
	// programmatic autoFocus below, so picking "Custom" doesn't show (or leave
	// showing, if a stale error was already set) an error before the user has
	// had a chance to type anything.
	const skipNextCustomFileAsFocusValidation = useRef(false);
	const onCustomFileAsFocus = useCallback(() => {
		if (skipNextCustomFileAsFocusValidation.current) {
			skipNextCustomFileAsFocusValidation.current = false;
			setShowCustomFileAsError(false);
			return;
		}
		if (isCustomFileAsEmpty) {
			setShowCustomFileAsError(true);
		}
	}, [isCustomFileAsEmpty]);

	// Typing only ever hides the error, the moment the field's content validates;
	// it never shows one, so erasing content without blurring keeps it hidden.
	const onNameFieldChange = useCallback(
		(ev) => {
			const { name, value } = ev.target;
			const firstName = name === 'firstName' ? value : contact?.firstName;
			const lastName = name === 'lastName' ? value : contact?.lastName;
			if (trim(firstName) || trim(lastName)) {
				setShowNameError(false);
			}
		},
		[contact?.firstName, contact?.lastName]
	);
	const onCustomFileAsChange = useCallback((ev) => {
		if (trim(ev.target.value)) {
			setShowCustomFileAsError(false);
		}
	}, []);

	// Leaving the field re-validates its committed value, showing the error if it's
	// still invalid or hiding it otherwise.
	const onNameFieldBlur = useCallback(() => setShowNameError(isNameMissing), [isNameMissing]);
	const onCustomFileAsBlur = useCallback(
		() => setShowCustomFileAsError(isCustomFileAsEmpty),
		[isCustomFileAsEmpty]
	);

	// Moves focus to the custom text field as soon as it becomes enabled after the
	// user picks the "Custom" option, so they can start typing right away.
	const fileAsFreeTextRef = useRef(null);
	const shouldFocusCustomFileAs = useRef(false);
	const onFileAsChange = useCallback(
		(value) => {
			dispatch({ type: op.setInput, payload: { name: 'fileAs', value } });
			if (value === FILE_AS_FREE_TEXT) {
				shouldFocusCustomFileAs.current = true;
				skipNextCustomFileAsFocusValidation.current = true;
			}
		},
		[dispatch]
	);
	useEffect(() => {
		if (shouldFocusCustomFileAs.current && contact?.fileAs === FILE_AS_FREE_TEXT) {
			shouldFocusCustomFileAs.current = false;
			fileAsFreeTextRef.current?.focus();
		}
	}, [contact?.fileAs]);

	const isDisabled = useMemo(() => {
		if (isCustomFileAsEmpty) {
			return true;
		}
		if (editId && editId !== 'new' && existingContact) {
			return Object.keys(fieldsToUpdate).length < 1 || !(contact?.firstName || contact?.lastName);
		}
		return !(contact?.firstName || contact?.lastName);
	}, [
		contact?.firstName,
		contact?.lastName,
		editId,
		existingContact,
		fieldsToUpdate,
		isCustomFileAsEmpty
	]);
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
			onTitleChanged && onTitleChanged(title);
		}
	}, [onTitleChanged, panel, title]);

	const onSubmit = useCallback(() => {
		const updatedContact = cleanMultivalueFields(contact);
		if (!updatedContact.id) {
			createContact(updatedContact)
				.then((res) => {
					if (panel) {
						navigate(`../folder/${folderId}/contacts/${res.id}`, { replace: true });
					} else {
						const normalizedContacts = normalizeContactsFromSoap([res]);
						addContactsToStore(normalizedContacts);
						onClose && onClose();
						createSnackbar({
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
			modifyContact({
				updatedContact
			})
				.then((res) => {
					const normalizedContacts = normalizeContactsFromSoap([res]);
					addContactsToStore(normalizedContacts);
					if (panel) {
						navigate(`../folder/${folderId}/contacts/${res.id}`, { replace: true });
					}
				})
				.catch(report);
		}
	}, [contact, createSnackbar, folderId, navigate, onClose, panel, t]);

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

	const fileAsOptions = useMemo(
		() => [
			{ label: t('file_as.last_first', 'Last, First'), value: 1 },
			{ label: t('file_as.first_last', 'First Last'), value: 2 },
			{ label: t('file_as.company', 'Company'), value: 3 },
			{ label: t('file_as.last_first_company', 'Last, First (Company)'), value: 4 },
			{ label: t('file_as.first_last_company', 'First Last (Company)'), value: 5 },
			{ label: t('file_as.company_last_first', 'Company (Last, First)'), value: 6 },
			{ label: t('file_as.company_first_last', 'Company (First Last)'), value: 7 },
			{ label: t('file_as.custom', 'Custom'), value: FILE_AS_FREE_TEXT }
		],
		[t]
	);

	const fileAsDescription = useMemo(
		() =>
			composeFileAsDescription(contact?.fileAs, {
				firstName: contact?.firstName,
				lastName: contact?.lastName,
				company: contact?.company,
				fileAsFreeText: contact?.fileAsFreeText
			}) || t('label.no_name', '<No Name>'),
		[
			contact?.company,
			contact?.fileAs,
			contact?.fileAsFreeText,
			contact?.firstName,
			contact?.lastName,
			t
		]
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
							<CustomText italic color={'gray1'}>
								{t('label.contact_created_in_folder', {
									name: selectedFolderName,
									defaultValue: 'This contact will be created in the "{{name}}" folder'
								})}
							</CustomText>
						)}
					</Container>
					<Tooltip
						label={t('message.require_field', 'Fill in the required fields to save')}
						placement="top"
						disabled={!isDisabled}
					>
						<Button label={t('label.save', 'Save')} onClick={onSubmit} disabled={isDisabled} />
					</Tooltip>
				</Row>
				<Padding value="medium small">
					<CompactView contact={contact} displayName={fileAsDescription} />
				</Padding>
				<ContactEditorRow>
					<Padding horizontal="small" vertical="medium" style={{ width: '100%' }}>
						<Text overflow="break-word">
							{t('label.name_hint', 'Enter a first name, a last name, or both.')}
						</Text>
					</Padding>
				</ContactEditorRow>
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
						hasError={showNameError}
						description={
							showNameError
								? t('validation.first_or_last_name_required', 'Enter a first name or a last name')
								: RESERVED_DESCRIPTION_SPACE
						}
						onFocus={onNameFieldFocus}
						onChange={onNameFieldChange}
						onBlur={onNameFieldBlur}
						// eslint-disable-next-line jsx-a11y/no-autofocus
						autoFocus={!editId || editId === 'new'}
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
						hasError={showNameError}
						description={
							showNameError
								? t('validation.first_or_last_name_required', 'Enter a first name or a last name')
								: RESERVED_DESCRIPTION_SPACE
						}
						onFocus={onNameFieldFocus}
						onChange={onNameFieldChange}
						onBlur={onNameFieldBlur}
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
				<FormSection label={t('label.file_as', 'File as')}>
					<ContactEditorRow>
						<Container
							padding={{ top: 'small', right: 'small', bottom: 'small' }}
							crossAlignment="flex-start"
							orientation="horizontal"
							mainAlignment="flex-start"
						>
							<Select
								label={t('file_as.select_placeholder', 'Select an option')}
								items={fileAsOptions}
								defaultSelection={find(fileAsOptions, ['value', contact.fileAs])}
								onChange={onFileAsChange}
							/>
						</Container>
						<CustomStringField
							name="fileAsFreeText"
							label={t('label.file_as_custom', 'Custom*')}
							value={contact.fileAsFreeText}
							dispatch={dispatch}
							disabled={contact.fileAs !== FILE_AS_FREE_TEXT}
							hidden={contact.fileAs !== FILE_AS_FREE_TEXT}
							inputRef={fileAsFreeTextRef}
							hasError={showCustomFileAsError}
							description={
								showCustomFileAsError
									? t(
											'validation.file_as_custom_required',
											'Enter a value or select a different option'
										)
									: RESERVED_DESCRIPTION_SPACE
							}
							onFocus={onCustomFileAsFocus}
							onChange={onCustomFileAsChange}
							onBlur={onCustomFileAsBlur}
						/>
					</ContactEditorRow>
				</FormSection>
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
					label={t('label.website_one', 'Website')}
					typeLabel={t('select.default', 'Select type')}
					typeField="type"
					types={defaultTypes}
					subFields={['url']}
					fieldLabels={[t('section.field.website', 'Website URL')]}
					value={contact.URL}
					dispatch={dispatch}
				/>
				<CustomMultivalueField
					name="address"
					label={t('section.title.address_one', 'Address')}
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
