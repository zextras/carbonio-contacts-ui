/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { Container, CustomModal, useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { Context } from './parts/edit/edit-context';
import EditDefaultModal from './parts/edit/edit-default-modal';
import ShareRevokeModal from './parts/edit/share-revoke-modal';
import ShareFolderModal from './share-folder-modal';

export const EditModal = ({ currentFolder, accordions, openModal, setModal, dispatch }) => {
	const createSnackbar = useSnackbar();
	const [activeModal, setActiveModal] = useState('default');
	const [activeGrant, setActiveGrant] = useState({});
	const onClose = useCallback(() => {
		setModal('');
	}, [setModal]);

	return (
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
	);
};
