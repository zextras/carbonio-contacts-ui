/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	Container,
	Divider,
	ModalFooter,
	ModalHeader,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Folder } from '../../carbonio-ui-commons/types/folder';
import { Contact } from '../../legacy/types/contact';
import { FolderTreeSelector } from '../folder-tree-selector/folder-tree-selector';

export type ContactMoveModalProps = {
	mode?: 'move' | 'restore';
	contacts: Array<Contact>;
	onClose: () => void;
	onMove: (parentAddressBookId: string) => void;
};

export const ContactMoveModal = ({
	mode = 'move',
	contacts,
	onClose,
	onMove
}: ContactMoveModalProps): React.JSX.Element => {
	const [t] = useTranslation();
	const [parentAddressBook, setParentAddressBook] = useState<Folder | undefined>();

	const modalTitle = useMemo(() => {
		if (mode === 'restore') {
			return contacts.length === 1
				? t('contact.modal.restore_single.title', {
						contactDesc: `${contacts[0].firstName} ${contacts[0].lastName}`,
						defaultValue: "Restore {{contactDesc}}'s contact"
					})
				: t('contact.modal.restore_multiple.title', {
						count: contacts.length,
						defaultValue: 'Restore {{count}} contacts'
					});
		}

		return contacts.length === 1
			? t('contact.modal.move_single.title', {
					contactDesc: `${contacts[0].firstName} ${contacts[0].lastName}`,
					defaultValue: "Move {{contactDesc}}'s contact"
				})
			: t('contact.modal.move_multiple.title', {
					count: contacts.length,
					defaultValue: 'Move {{count}} contacts'
				});
	}, [contacts, mode, t]);

	const confirmLabel = useMemo(
		() => (mode === 'restore' ? t('label.restore', 'Restore') : t('label.move', 'Move')),
		[mode, t]
	);

	const confirmDisabled = useMemo(() => parentAddressBook === undefined, [parentAddressBook]);

	// Exclude an address book if all the contacts belong to it
	const excludedAddressBooksIds = useMemo<Array<string>>(() => {
		const currentAddressBooksId = new Set<string>(contacts.map((contact) => contact.parent));
		return currentAddressBooksId.size > 1 ? [] : Array.from(currentAddressBooksId.values());
	}, [contacts]);

	const onConfirm = useCallback(() => {
		parentAddressBook && onMove(parentAddressBook.id);
	}, [onMove, parentAddressBook]);

	const onParentAddressBookSelected = useCallback((addressBook: Folder) => {
		setParentAddressBook(addressBook);
	}, []);

	return (
		<>
			<ModalHeader title={modalTitle} onClose={onClose} showCloseIcon />
			<Divider />
			<Padding vertical={'medium'}>
				<Container
					gap={'0.5rem'}
					mainAlignment={'flex-start'}
					crossAlignment={'flex-start'}
					height={'fit'}
				>
					<FolderTreeSelector
						onFolderSelected={onParentAddressBookSelected}
						showSharedAccounts
						showTrashFolder={false}
						showLinkedFolders
						excludeIds={excludedAddressBooksIds}
						allowRootSelection={false}
						allowFolderCreation={false}
					/>
				</Container>
			</Padding>
			<Divider />
			<ModalFooter
				confirmLabel={confirmLabel}
				confirmDisabled={confirmDisabled}
				onConfirm={onConfirm}
			/>
		</>
	);
};
