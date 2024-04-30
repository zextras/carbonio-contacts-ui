/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Container,
	Input,
	InputProps,
	ModalBody,
	ModalFooter,
	ModalHeader,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder/hooks';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../constants';
import { apiClient } from '../../network/api-client';
import { FolderTreeSelector } from '../folder-tree-selector/folder-tree-selector';

export type AddressBookCreateModalProps = {
	defaultParentId?: string;
	onClose: () => void;
};

export const AddressBookCreateModal = ({
	defaultParentId,
	onClose
}: AddressBookCreateModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const defaultParent = useFolder(defaultParentId ?? FOLDERS.USER_ROOT);

	const [newAddressBookName, setNewAddressBookName] = useState<string>('');
	const [parentAddressBook, setParentAddressBook] = useState<Folder | undefined>(defaultParent);

	const modalTitle = useMemo(() => t('folder.modal.new.title', 'Create new address book'), [t]);
	const confirmLabel = useMemo(() => t('label.create', 'Create'), [t]);

	const addressBookAlreadyExists = useMemo(
		() => filter(defaultParent?.children, (child) => child.name === newAddressBookName).length > 0,
		[defaultParent?.children, newAddressBookName]
	);

	const addressBookNameFieldLabel = useMemo(
		() =>
			addressBookAlreadyExists
				? t('folder.modal.new.input.name_exist', 'Name already exists in this path')
				: t('folder.modal.new.input.name', 'Insert address book name'),
		[addressBookAlreadyExists, t]
	);

	const confirmDisabled = useMemo(
		() =>
			newAddressBookName === undefined ||
			newAddressBookName.trim().length === 0 ||
			parentAddressBook === undefined ||
			addressBookAlreadyExists,
		[addressBookAlreadyExists, newAddressBookName, parentAddressBook]
	);

	const onAddressBookNameChanged = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => setNewAddressBookName(ev.target.value),
		[]
	);

	const onParentAddressBookSelected = useCallback((addressBook: Folder) => {
		setParentAddressBook(addressBook);
	}, []);

	const onConfirm = useCallback(() => {
		if (!parentAddressBook || !newAddressBookName) {
			return;
		}
		apiClient
			.createFolder({
				parentFolderId: parentAddressBook.id ?? FOLDERS.CONTACTS,
				name: newAddressBookName
			})
			.then(() => {
				createSnackbar({
					key: `create-address-book-success`,
					replace: true,
					type: 'success',
					label: t('folder.snackbar.folder_new', 'New address book created'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
				onClose();
			})
			.catch(() => {
				createSnackbar({
					key: `create-address-book-error`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [createSnackbar, newAddressBookName, onClose, parentAddressBook, t]);

	return (
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<ModalBody>
				<Container
					gap={'0.5rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'fit'}
				>
					<Input
						label={addressBookNameFieldLabel}
						backgroundColor={'gray5'}
						hasError={addressBookAlreadyExists}
						value={newAddressBookName}
						onChange={onAddressBookNameChanged}
					/>
					<FolderTreeSelector
						selectedFolderId={parentAddressBook?.id}
						onFolderSelected={onParentAddressBookSelected}
						showSharedAccounts={false}
						showTrashFolder={false}
						showLinkedFolders={false}
						allowRootSelection
						allowFolderCreation={false}
					/>
				</Container>
			</ModalBody>
			<ModalFooter
				confirmLabel={confirmLabel}
				confirmDisabled={confirmDisabled}
				onConfirm={onConfirm}
			/>
		</>
	);
};
