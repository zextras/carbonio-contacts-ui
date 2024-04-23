/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';

import { Container, CustomModal, useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { Context } from './edit-context';
import EditDefaultModal from './edit-default-modal';
import ShareFolderModal from './share-folder-modal';
import ShareRevokeModal from './share-revoke-modal';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';

export type AddressBookEditModalProps = {
	addressBookId: string;
	onClose: () => void;
};

export const AddressBookEditModal = ({
	addressBookId,
	onClose
}: AddressBookEditModalProps): React.JSX.Element => {
	const addressBook = useFolder(addressBookId);
	const createSnackbar = useSnackbar();
	const [activeModal, setActiveModal] = useState('default');
	const [activeGrant, setActiveGrant] = useState({});

	return (
		<>
			<CustomModal open={openModal} onClose={onClose} maxHeight="90vh" size="medium">
				<Context.Provider
					value={{ activeModal, setActiveModal, activeGrant, setActiveGrant, onClose }}
				>
					<Container
						padding={{ all: 'medium' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
					>
						{activeModal === 'default' && (
							<EditDefaultModal
								currentFolder={currentFolder}
								setModal={setModal}
								dispatch={dispatch}
								setActiveModal={setActiveModal}
								accordions={accordions}
							/>
						)}

						{activeModal === 'edit' && (
							<ShareFolderModal
								openModal
								title="edit"
								activeGrant={activeGrant}
								goBack={() => setActiveModal('default')}
								folder={currentFolder}
								folders={[]}
								setModal={setModal}
								dispatch={dispatch}
								allFolders={[]}
								t={t}
								editMode
								setActiveModal={setActiveModal}
								createSnackbar={createSnackbar}
							/>
						)}

						{activeModal === 'revoke' && (
							<ShareRevokeModal
								folder={currentFolder}
								goBack={() => setActiveModal('default')}
								onClose={() => setModal('')}
								grant={activeGrant || currentFolder?.acl?.grant[0]}
								createSnackbar={createSnackbar}
							/>
						)}

						{activeModal === 'share' && (
							<ShareFolderModal
								openModal
								title="edit"
								activeGrant={activeGrant}
								goBack={() => setActiveModal('default')}
								folder={currentFolder}
								setModal={setModal}
								dispatch={dispatch}
								t={t}
								setActiveModal={setActiveModal}
								createSnackbar={createSnackbar}
							/>
						)}
					</Container>
				</Context.Provider>
			</CustomModal>
		</>
	);
};
