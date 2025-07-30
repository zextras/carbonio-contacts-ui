/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Container, Divider, ModalFooter, ModalHeader } from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { FolderTreeSelector } from 'components/folder-tree-selector/folder-tree-selector';
import { ModalContentAndFooterWrapper } from 'components/modals/modal-content-and-footer-wrapper';

export type FolderIsContainedInModalProps = {
	onClose: () => void;
	confirmAction: (parentAddressBookId: Folder, _onClose: () => void) => void;
};

export const FolderIsContainedInModal = ({
	onClose,
	confirmAction
}: FolderIsContainedInModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [parentAddressBook, setParentAddressBook] = useState<Folder | undefined>();

	const confirmDisabled = useMemo(() => parentAddressBook === undefined, [parentAddressBook]);

	const onConfirm = useCallback(() => {
		parentAddressBook && confirmAction(parentAddressBook, onClose);
	}, [confirmAction, onClose, parentAddressBook]);

	const onParentAddressBookSelected = useCallback((addressBook: Folder) => {
		setParentAddressBook(addressBook);
	}, []);

	return (
		<Container
			mainAlignment="center"
			crossAlignment="flex-start"
			height="100%"
			style={{
				overflowY: 'auto'
			}}
		>
			<ModalHeader
				title={t('share.is_contained_in', 'Is contained in')}
				onClose={onClose}
				showCloseIcon
			/>
			<Divider />
			<ModalContentAndFooterWrapper>
				<Container
					mainAlignment={'flex-start'}
					crossAlignment="flex-start"
					height="fit"
					minHeight={'50vh'}
					style={{
						overflowY: 'auto'
					}}
				>
					<FolderTreeSelector
						onFolderSelected={onParentAddressBookSelected}
						showSharedAccounts
						showTrashFolder
						showLinkedFolders
						allowRootSelection={false}
						allowFolderCreation={false}
					/>
				</Container>
				<Divider />
				<ModalFooter
					confirmLabel={t('advancedFilters.isContainedIn.chooseFolder', 'Choose folder')}
					confirmDisabled={confirmDisabled}
					onConfirm={onConfirm}
					secondaryActionLabel={t('label.cancel', 'Cancel')}
					onSecondaryAction={onClose}
				/>
			</ModalContentAndFooterWrapper>
		</Container>
	);
};
