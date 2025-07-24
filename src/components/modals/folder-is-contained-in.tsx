/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Divider, ModalFooter, ModalHeader } from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { FolderTreeSelector } from 'components/folder-tree-selector/folder-tree-selector';
import { ModalContentAndFooterWrapper } from 'components/modals/modal-content-and-footer-wrapper';
import { ModalWrapper } from 'components/modals/modal-wrapper';

export type FolderIsContainedInModalProps = {
	// addressBookId: string;
	onClose: () => void;
	confirmAction: (parentAddressBookId: Folder, _onClose: () => void) => void;
};

export const FolderIsContainedInModal = ({
	// addressBookId,
	onClose,
	confirmAction
}: FolderIsContainedInModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	// const addressBook = useFolder(addressBookId);
	const [parentAddressBook, setParentAddressBook] = useState<Folder | undefined>();

	const confirmDisabled = useMemo(() => parentAddressBook === undefined, [parentAddressBook]);

	const onConfirm = useCallback(() => {
		parentAddressBook && confirmAction(parentAddressBook, onClose);
	}, [confirmAction, onClose, parentAddressBook]);

	const onParentAddressBookSelected = useCallback((addressBook: Folder) => {
		setParentAddressBook(addressBook);
	}, []);

	return (
		<ModalWrapper>
			<ModalHeader
				title={t('share.is_contained_in', 'Is contained in')}
				onClose={onClose}
				showCloseIcon
			/>
			<Divider />
			<ModalContentAndFooterWrapper>
				<FolderTreeSelector
					onFolderSelected={onParentAddressBookSelected}
					showSharedAccounts
					showTrashFolder
					showLinkedFolders
					allowRootSelection
					allowFolderCreation={false}
				/>
				<Divider />
				<ModalFooter
					confirmLabel={t('label.move', 'Move')}
					confirmDisabled={confirmDisabled}
					onConfirm={onConfirm}
					secondaryActionLabel={t('label.cancel', 'Cancel')}
					onSecondaryAction={onClose}
				/>
			</ModalContentAndFooterWrapper>
		</ModalWrapper>
	);
};
