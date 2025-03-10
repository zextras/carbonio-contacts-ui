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

import { Folder } from '../carbonio-ui-commons/types';
import { FolderTreeSelector } from '../components/folder-tree-selector/folder-tree-selector';

export type MoveItemModalProps = {
	modal: {
		id: string;
		title: string;
		confirmButtonLabel: string;
	};
};
type UseMoveItems = MoveItemModalProps & {
	actionId: string;
	icon: string;
	label: string;
	onMoveConfirm: (targetFolder: Folder) => Promise<void>;
};
type MoveActionBase = {
	id: string;
	icon: string;
	label: string;
	execute: () => void;
};

const BaseMoveModal = ({
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
	const onMoveConfirm = (): void => {
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
				onConfirm={onMoveConfirm}
			/>
		</>
	);
};

function useCreateMoveModalAction(): ({
	modal,
	icon,
	onMoveConfirm
}: UseMoveItems) => MoveActionBase {
	const { createModal, closeModal } = useModal();
	const createMoveModal = (
		modalId: string,
		modalTitle: string,
		modalConfirmLabel: string,
		doMove: (targetFolder: Folder) => Promise<void>
	): void => {
		const onClose = (): void => closeModal(modalId);
		createModal(
			{
				id: modalId,
				children: (
					<BaseMoveModal
						onClose={onClose}
						onConfirm={doMove}
						modalTitle={modalTitle}
						confirmLabel={modalConfirmLabel}
					/>
				)
			},
			true
		);
	};

	return ({ actionId, modal, icon, label, onMoveConfirm }): MoveActionBase => {
		const openMoveModal = (): void => {
			createMoveModal(modal.id, modal.title, modal.confirmButtonLabel, onMoveConfirm);
		};

		return {
			id: actionId,
			label,
			icon,
			execute: openMoveModal
		};
	};
}

export const useMoveItemsAction = (props: UseMoveItems): MoveActionBase => {
	const createMoveAction = useCreateMoveModalAction();
	return createMoveAction(props);
};
