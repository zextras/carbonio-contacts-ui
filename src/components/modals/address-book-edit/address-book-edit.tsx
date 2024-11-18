/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { AddressBookEditGeneralModal } from './address-book-edit-general';
import { ShareFolderModal } from './share-folder-modal';
import { ShareRevokeModal } from './share-revoke-modal';
import { Grant } from '../../../carbonio-ui-commons/types/folder';

export type AddressBookEditModalProps = {
	addressBookId: string;
	onClose: () => void;
};

export const AddressBookEditModal = ({
	addressBookId,
	onClose
}: AddressBookEditModalProps): React.JSX.Element => {
	const [activeSubModal, setActiveSubModal] = useState<React.JSX.Element | undefined>(undefined);

	const onEditShare = useCallback(
		(grant: Grant) => {
			const modal = (
				<ShareFolderModal
					activeGrant={grant}
					onClose={(): void => setActiveSubModal(undefined)}
					addressBookId={addressBookId}
					editMode
				/>
			);
			setActiveSubModal(modal);
		},
		[addressBookId]
	);

	const onAddShare = useCallback((): void => {
		const grant: Grant = {
			perm: 'r',
			gt: 'usr'
		};
		const modal = (
			<ShareFolderModal
				onClose={(): void => setActiveSubModal(undefined)}
				addressBookId={addressBookId}
				activeGrant={grant}
			/>
		);
		setActiveSubModal(modal);
	}, [addressBookId]);

	const onRevokeShare = useCallback(
		(grant: Grant) => {
			const modal = (
				<ShareRevokeModal
					addressBookId={addressBookId}
					onClose={(): void => setActiveSubModal(undefined)}
					grant={grant}
				/>
			);
			setActiveSubModal(modal);
		},
		[addressBookId]
	);

	return (
		activeSubModal ?? (
			<AddressBookEditGeneralModal
				addressBookId={addressBookId}
				onAddShare={onAddShare}
				onEditShare={onEditShare}
				onRevokeShare={onRevokeShare}
				onClose={onClose}
			/>
		)
	);
};
