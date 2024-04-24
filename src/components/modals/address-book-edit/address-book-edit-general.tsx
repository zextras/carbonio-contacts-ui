/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';

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
import { useTranslation } from 'react-i18next';

import { ShareFolderProperties } from './share-folder-properties';
import {
	ColorSelect,
	ColorSelectProps
} from '../../../carbonio-ui-commons/components/select/color-select';
import { isSystemFolder } from '../../../carbonio-ui-commons/helpers/folders';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Grant } from '../../../carbonio-ui-commons/types/folder';
import { TIMEOUTS } from '../../../constants';
import { apiClient } from '../../../network/api-client';

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
	const [addressBookColor, setAddressBookColor] = useState(addressBook?.color ?? 0);

	const modalTitle = useMemo(
		() =>
			t('label.edit_folder_properties', {
				name: addressBook?.name,
				defaultValue: "Edit {{name}}'s properties"
			}),
		[addressBook?.name, t]
	);

	const confirmButtonDisabled = useMemo(
		() => addressBook?.name === addressBookName && addressBook?.color === addressBookColor,
		[addressBook, addressBookName, addressBookColor]
	);

	const close = useCallback(() => onClose(), [onClose]);

	const onConfirm = useCallback(() => {
		apiClient
			.updateFolder({
				folderId: addressBookId,
				name: addressBookName,
				color: addressBookColor
			})
			.then(() => {
				createSnackbar({
					key: `address-book-edit-success`,
					replace: true,
					type: 'info',
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
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar
				});
			});
	}, [addressBookId, addressBookName, addressBookColor, createSnackbar, t, close]);

	const onAddressBookInputChange = useCallback((e) => setAddressBookName(e.target.value), []);

	const onColorChange = useCallback<ColorSelectProps['onChange']>(
		(color) => setAddressBookColor(Number(color)),
		[]
	);

	const showShared = useMemo(
		() => addressBook?.acl?.grant && addressBook.acl?.grant.length > 0,
		[addressBook?.acl?.grant]
	);

	const addressBookInputDisabled = useMemo(() => isSystemFolder(addressBookId), [addressBookId]);
	return (
		<>
			<Container
				padding={{ vertical: 'medium', horizontal: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader onClose={onClose} title={modalTitle} showCloseIcon />

				<Container
					orientation="horizontal"
					mainAlignment="center"
					crossAlignment="flex-start"
					padding={{ vertical: 'small' }}
				>
					<Input
						label={t('modal.address_book_name', 'Address book name')}
						backgroundColor="gray5"
						value={addressBookName}
						onChange={onAddressBookInputChange}
						disabled={addressBookInputDisabled}
					/>
				</Container>
				<Padding top="small" />
				<ColorSelect
					onChange={onColorChange}
					label={t('label.select_color', 'Select Color')}
					defaultColor={addressBookColor ?? 0}
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
				<Divider />
				<Padding vertical="small" />

				{showShared && (
					<ShareFolderProperties
						addressBookId={addressBookId}
						onEdit={onEditShare}
						onRevoke={onRevokeShare}
					/>
				)}

				<ModalFooter
					onConfirm={onConfirm}
					confirmLabel={t('label.edit', 'Edit')}
					onSecondaryAction={onAddShare}
					secondaryActionLabel={t('label.add_share', 'Add Share')}
					confirmDisabled={confirmButtonDisabled}
					confirmColor="primary"
				/>
			</Container>
		</>
	);
};
