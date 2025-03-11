/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import {
	Container,
	Divider,
	ModalFooter,
	ModalHeader,
	Padding,
	useModal
} from '@zextras/carbonio-design-system';

import { Action } from './types';
import { Folder } from '../carbonio-ui-commons/types';
import { FolderTreeSelector } from '../components/folder-tree-selector/folder-tree-selector';

type UseSelectFolderModalActionProps = {
	modal: {
		id: string;
		title: string;
		confirmButtonLabel: string;
	};
	actionId: string;
	icon: string;
	label: string;
	onConfirm: (targetFolder: Folder) => Promise<void>;
};

const SelectFolderModal = ({
	onClose,
	onConfirm,
	modalTitle,
	confirmLabel
}: {
	onConfirm: (targetFolder: Folder) => Promise<void>;
	onClose: () => void;
	modalTitle: string;
	confirmLabel: string;
}): React.JSX.Element => {
	const [targetFolder, setTargetFolder] = useState<Folder | undefined>();
	const onFolderSelected = useCallback((selectedFolder: Folder) => {
		setTargetFolder(selectedFolder);
	}, []);
	const _onConfirm = (): void => {
		targetFolder &&
			onConfirm(targetFolder).then(() => {
				onClose();
			});
	};
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
						onFolderSelected={onFolderSelected}
						showSharedAccounts
						showTrashFolder={false}
						showLinkedFolders
						allowRootSelection={false}
						allowFolderCreation={false}
					/>
				</Container>
			</Padding>
			<Divider />
			<ModalFooter
				confirmLabel={confirmLabel}
				confirmDisabled={!targetFolder}
				onConfirm={_onConfirm}
			/>
		</>
	);
};

function useSelectFolderModalAction(): ({
	modal,
	icon,
	onConfirm
}: UseSelectFolderModalActionProps) => Action {
	const { createModal, closeModal } = useModal();
	return ({ actionId, modal, icon, label, onConfirm }): Action => {
		const openSelectFolderModal = (): void => {
			const onClose = (): void => closeModal(modal.id);
			createModal(
				{
					id: modal.id,
					children: (
						<SelectFolderModal
							onClose={onClose}
							onConfirm={onConfirm}
							modalTitle={modal.title}
							confirmLabel={modal.confirmButtonLabel}
						/>
					)
				},
				true
			);
		};
		return {
			id: actionId,
			label,
			icon,
			onClick: openSelectFolderModal
		};
	};
}

export const useSelectFolderAction = (props: UseSelectFolderModalActionProps): Action => {
	const createSelectFolderAction = useSelectFolderModalAction();
	return createSelectFolderAction(props);
};
