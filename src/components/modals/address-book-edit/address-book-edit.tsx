/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { Container, CustomModal } from '@zextras/carbonio-design-system';

import { AddressBookEditGeneralModal } from './address-book-edit-general';
import ShareFolderModal from './share-folder-modal';
import ShareRevokeModal from './share-revoke-modal';
import { Grant } from '../../../carbonio-ui-commons/types/folder';

export type AddressBookEditModalProps = {
	addressBookId: string;
	onClose: () => void;
};

export const AddressBookEditModal = ({
	addressBookId,
	onClose
}: AddressBookEditModalProps): React.JSX.Element => {
	// const createSnackbar = useSnackbar();
	// const [activeModal, setActiveModal] = useState<
	// 	'default' | 'editShare' | 'revokeShare' | 'addShare'
	// >('default');
	// const [activeGrant, setActiveGrant] = useState({});

	const [activeModal, setActiveModal] = useState<React.JSX.Element>();

	const onEditShareModal = useCallback(
		(grant: Grant) => {
			const modal = (
				<ShareFolderModal
					activeGrant={grant}
					onClose={showGeneralModal}
					addressBookId={addressBookId}
					editMode
				/>
			);
			setActiveModal(modal);
		},
		[addressBookId, showGeneralModal]
	);

	const showAddShareModal = useCallback((): void => {
		const grant: Grant = {
			perm: 'r',
			gt: 'usr'
		};
		const modal = (
			<ShareFolderModal
				onClose={showGeneralModal}
				addressBookId={addressBookId}
				activeGrant={grant}
			/>
		);
		setActiveModal(modal);
	}, [addressBookId, showGeneralModal]);

	const showRevokeShareModal = useCallback(
		(grant) => {
			const modal = (
				<ShareRevokeModal addressBookId={addressBookId} onClose={showGeneralModal} grant={grant} />
			);
			setActiveModal(modal);
		},
		[addressBookId, showGeneralModal]
	);

	const showGeneralModal = useCallback((): void => {
		const modal = (
			<AddressBookEditGeneralModal
				addressBookId={addressBookId}
				onAddShare={showAddShareModal}
				onClose={showGeneralModal}
			/>
		);
		setActiveModal(modal);
	}, [addressBookId, showAddShareModal]);

	return (
		<>
			<CustomModal onClose={onClose} maxHeight="90vh" size="medium">
				<Container
					padding={{ all: 'medium' }}
					mainAlignment="center"
					crossAlignment="flex-start"
					height="fit"
				>
					{activeModal}

					{/* {activeModal === 'default' && ( */}
					{/*	<AddressBookEditGeneralModal */}
					{/*		addressBookId={addressBookId} */}
					{/*	/> */}
					{/* )} */}

					{/* {activeModal === 'editShare' && ( */}
					{/*	<ShareFolderModal */}
					{/*		title="edit" */}
					{/*		activeGrant={activeGrant} */}
					{/*		goBack={showGeneralModal} */}
					{/*		addressBookId={addressBookId} */}
					{/*		editMode */}
					{/*	/> */}
					{/* )} */}

					{/* {activeModal === 'revokeShare' && ( */}
					{/*	<ShareRevokeModal */}
					{/*		addressBookId={addressBookId} */}
					{/*		goBack={() => setActiveModal('default')} */}
					{/*		onClose={showGeneralModal} */}
					{/*		grant={activeGrant || currentFolder?.acl?.grant[0]} */}
					{/*		createSnackbar={createSnackbar} */}
					{/*	/> */}
					{/* )} */}

					{/* {activeModal === 'share' && ( */}
					{/*	<ShareFolderModal */}
					{/*		openModal */}
					{/*		title="edit" */}
					{/*		activeGrant={activeGrant} */}
					{/*		goBack={() => setActiveModal('default')} */}
					{/*		folder={currentFolder} */}
					{/*		setModal={setModal} */}
					{/*		dispatch={dispatch} */}
					{/*		t={t} */}
					{/*		setActiveModal={setActiveModal} */}
					{/*		createSnackbar={createSnackbar} */}
					{/*	/> */}
					{/* )} */}
				</Container>
			</CustomModal>
		</>
	);
};
