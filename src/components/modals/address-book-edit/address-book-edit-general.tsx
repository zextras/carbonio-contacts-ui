/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import {
	Container,
	Input,
	Text,
	Padding,
	Row,
	Divider,
	useSnackbar,
	ModalHeader,
	ModalFooter
} from '@zextras/carbonio-design-system';
import {
	FolderColorPicker,
	isAdministerAllowed,
	isSystemFolder,
	resolveFolderColorHex,
	useFolder,
	Grant
} from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { ShareFolderProperties } from 'components/modals/address-book-edit/share-folder-properties';
import { TIMEOUTS } from 'constants/index';
import { getFolderTranslatedName } from 'legacy/utils/helpers';
import { apiClient } from 'network/api-client';

export type AddressBookEditGeneralModalProps = {
	addressBookId: string;
	onAddShare: () => void;
	onEditShare: (grant: Grant) => void;
	onRevokeShare: (grant: Grant) => void;
	onClose: () => void;
};

export const AddressBookEditGeneralModal = ({
	addressBookId,
	onAddShare,
	onEditShare,
	onRevokeShare,
	onClose
}: AddressBookEditGeneralModalProps): React.JSX.Element => {
	const addressBook = useFolder(addressBookId);
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const [addressBookName, setAddressBookName] = useState(addressBook?.name ?? '');
	const initialAddressBookColorHex = useMemo(
		() => resolveFolderColorHex(addressBook?.color, addressBook?.rgb),
		[addressBook?.color, addressBook?.rgb]
	);
	const [addressBookColorHex, setAddressBookColorHex] = useState(initialAddressBookColorHex);
	const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
	const nameInputRef = useRef<HTMLInputElement>(null);

	const modalTitle = useMemo(
		() =>
			t('label.edit_folder_properties', {
				name: addressBook ? getFolderTranslatedName(t, addressBook.id, addressBook.name) : '',
				defaultValue: "Edit {{name}}'s properties"
			}),
		[addressBook, t]
	);

	const confirmButtonDisabled = useMemo(
		() =>
			(addressBook?.name === addressBookName &&
				initialAddressBookColorHex === addressBookColorHex) ||
			addressBookName.trim().length === 0 ||
			isColorPickerOpen,
		[
			addressBook,
			addressBookName,
			initialAddressBookColorHex,
			addressBookColorHex,
			isColorPickerOpen
		]
	);

	const addShareDisabled = useMemo(
		() => !addressBook || !isAdministerAllowed(addressBook) || isColorPickerOpen,
		[addressBook, isColorPickerOpen]
	);

	const close = useCallback(() => onClose(), [onClose]);

	const onCloseModal = useCallback(() => {
		if (!isColorPickerOpen) {
			onClose();
		}
	}, [isColorPickerOpen, onClose]);

	const onConfirm = useCallback(() => {
		apiClient
			.updateFolder({
				folderId: addressBookId,
				name: addressBookName,
				// Always sent as `rgb`, even for a standard color: an update carrying only `color` doesn't
				// clear an existing `rgb`, so the address book would keep showing its previous custom color.
				rgb: addressBookColorHex !== initialAddressBookColorHex ? addressBookColorHex : undefined
			})
			.then(() => {
				createSnackbar({
					key: `address-book-edit-success`,
					replace: true,
					severity: 'info',
					hideButton: true,
					label: t('snackbar.folder_edited', 'Address book edited successfully'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});
				close();
			})
			.catch(() => {
				createSnackbar({
					key: `address-book-edit-error`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});
			});
	}, [
		addressBookId,
		addressBookName,
		addressBookColorHex,
		initialAddressBookColorHex,
		createSnackbar,
		t,
		close
	]);

	const onAddressBookInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => setAddressBookName(e.target.value),
		[]
	);

	const showShared = useMemo(
		() => addressBook?.acl?.grant && addressBook.acl?.grant.length > 0,
		[addressBook?.acl?.grant]
	);

	const addressBookInputDisabled = useMemo(() => isSystemFolder(addressBookId), [addressBookId]);

	useEffect(() => {
		if (!addressBookInputDisabled) {
			requestAnimationFrame(() => {
				nameInputRef.current?.focus();
			});
		}
	}, [addressBookInputDisabled]);

	return (
		<Container
			padding={{ vertical: 'medium', horizontal: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onCloseModal} title={modalTitle} showCloseIcon />
			<Divider />

			<Container
				orientation="horizontal"
				mainAlignment="center"
				crossAlignment="flex-start"
				padding={{ vertical: 'small' }}
			>
				<Input
					label={`${t('label.choose_representative_name', 'Choose a representative name')}*`}
					backgroundColor="gray5"
					value={addressBookName}
					onChange={onAddressBookInputChange}
					disabled={addressBookInputDisabled || isColorPickerOpen}
					inputRef={nameInputRef}
				/>
			</Container>
			<Padding top="small" />
			<FolderColorPicker
				value={addressBookColorHex}
				onChange={setAddressBookColorHex}
				onOpenChange={setIsColorPickerOpen}
				caption={t(
					'label.choose_address_book_color_caption',
					'Choose a color to make this address book easier to recognize'
				)}
			/>
			<Padding top="small" />
			<Container orientation="horizontal" mainAlignment="center" crossAlignment="flex-start">
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					width="48%"
					style={{ minHeight: '3rem', maxWidth: 'calc(100% - 3rem)' }}
				>
					<Text color="secondary">{t('label.type', 'Type')}</Text>
					<Row
						takeAvailableSpace
						wrap="nowrap"
						height="fit"
						width="fill"
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ top: 'small' }}
					>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text size="medium" overflow="break-word">
								{t('folder.type', 'Contact Folder')}
							</Text>
						</Row>
					</Row>
				</Container>
				<Padding horizontal="small" />
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					width="48%"
					style={{ minHeight: '3rem', maxWidth: 'calc(100% - 3rem)' }}
				>
					<Text color="secondary">{t('label.contacts', 'Contacts')}</Text>
					<Row
						takeAvailableSpace
						wrap="nowrap"
						height="fit"
						width="fill"
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ top: 'extrasmall' }}
					>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text size="medium" overflow="break-word">
								{addressBook?.n}
							</Text>
						</Row>
					</Row>
				</Container>
			</Container>

			{showShared && (
				<>
					<Divider />
					<Padding vertical="small" />
					<ShareFolderProperties
						addressBookId={addressBookId}
						onEdit={onEditShare}
						onRevoke={onRevokeShare}
					/>
				</>
			)}

			<Divider />

			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('label.edit', 'Edit')}
				onSecondaryAction={onAddShare}
				secondaryActionLabel={t('label.add_share', 'Add Share')}
				secondaryActionDisabled={addShareDisabled}
				confirmDisabled={confirmButtonDisabled}
				confirmColor="primary"
			/>
		</Container>
	);
};
