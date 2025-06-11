/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Divider, ModalFooter, ModalHeader } from '@zextras/carbonio-design-system';
import { useFolder, Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { ModalContentAndFooterWrapper } from 'components/modals/modal-content-and-footer-wrapper';
import { ModalWrapper } from 'components/modals/modal-wrapper';
import { FolderTreeSelector } from 'components/folder-tree-selector/folder-tree-selector';

export type AddressBookMoveModalProps = {
	addressBookId: string;
	onClose: () => void;
	onMove: (parentAddressBookId: string) => void;
};

export const AddressBookMoveModal = ({
	addressBookId,
	onClose,
	onMove
}: AddressBookMoveModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const addressBook = useFolder(addressBookId);
	const [parentAddressBook, setParentAddressBook] = useState<Folder | undefined>();

	const modalTitle = useMemo(
		() =>
			t('folder.modal.move.title', {
				addressBookName: addressBook?.name,
				defaultValue: 'Move {{addressBookName}}'
			}),
		[addressBook?.name, t]
	);
	const confirmLabel = useMemo(() => t('label.move', 'Move'), [t]);

	const confirmDisabled = useMemo(() => parentAddressBook === undefined, [parentAddressBook]);

	const onConfirm = useCallback(() => {
		parentAddressBook && onMove(parentAddressBook.id);
	}, [onMove, parentAddressBook]);

	const onParentAddressBookSelected = useCallback((addressBook: Folder) => {
		setParentAddressBook(addressBook);
	}, []);

	return (
		<ModalWrapper>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<Divider />
			<ModalContentAndFooterWrapper>
				<FolderTreeSelector
					onFolderSelected={onParentAddressBookSelected}
					showSharedAccounts
					showTrashFolder={false}
					showLinkedFolders
					excludeIds={addressBook?.parent ? [addressBook?.parent] : []}
					allowRootSelection
					allowFolderCreation={false}
				/>
				<Divider />
				<ModalFooter
					confirmLabel={confirmLabel}
					confirmDisabled={confirmDisabled}
					onConfirm={onConfirm}
				/>
			</ModalContentAndFooterWrapper>
		</ModalWrapper>
	);
};
