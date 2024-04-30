/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Container, ModalBody, ModalFooter, ModalHeader } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder/hooks';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { FolderTreeSelector } from '../folder-tree-selector/folder-tree-selector';

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
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<ModalBody>
				<Container
					gap={'0.5rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'fit'}
				>
					<FolderTreeSelector
						onFolderSelected={onParentAddressBookSelected}
						showSharedAccounts={false}
						showTrashFolder={false}
						showLinkedFolders={false}
						excludeIds={addressBook?.parent ? [addressBook?.parent] : []}
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
