/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { Divider, ModalFooter, ModalHeader, useModal } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';

import { Action } from './types';
import { useFolder, useRoot } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types';
import { FolderTreeSelector } from '../components/folder-tree-selector/folder-tree-selector';
import { ModalContentAndFooterWrapper } from '../components/modals/modal-content-and-footer-wrapper';
import { ModalWrapper } from '../components/modals/modal-wrapper';

type OnConfirmFn = (targetFolder: Folder, onModalCloseCallbackFn: () => void) => void;
type UseSelectFolderModalActionProps = {
	modal: {
		id: string;
		title: string;
		confirmButtonLabel: string;
	};
	actionId: string;
	icon: string;
	label: string;
	onConfirm: OnConfirmFn;
};

const SelectFolderModal = ({
	onClose,
	onConfirm,
	modalTitle,
	confirmLabel,
	root
}: {
	onConfirm: OnConfirmFn;
	onClose: () => void;
	modalTitle: string;
	confirmLabel: string;
	root: Folder;
}): React.JSX.Element => {
	const [targetFolder, setTargetFolder] = useState<Folder | undefined>();
	const onFolderSelected = useCallback((selectedFolder: Folder) => {
		setTargetFolder(selectedFolder);
	}, []);
	const _onConfirm = (): void => {
		targetFolder && onConfirm(targetFolder, onClose);
	};
	return (
		<ModalWrapper>
			<ModalHeader onClose={onClose} title={modalTitle} showCloseIcon />
			<Divider />
			<ModalContentAndFooterWrapper>
				<FolderTreeSelector
					root={root}
					onFolderSelected={onFolderSelected}
					showTrashFolder={false}
					showLinkedFolders
					allowRootSelection={false}
				/>
				<Divider />
				<ModalFooter
					confirmLabel={confirmLabel}
					confirmDisabled={!targetFolder}
					onConfirm={_onConfirm}
				/>
			</ModalContentAndFooterWrapper>
		</ModalWrapper>
	);
};

function useSelectFolderModalAction(): ({
	modal,
	icon,
	onConfirm
}: UseSelectFolderModalActionProps) => Action {
	const { createModal, closeModal } = useModal();
	const { folderId } = useParams() as { folderId: string };
	const root = useRoot(folderId);
	return ({ actionId, modal, icon, label, onConfirm }): Action => {
		const openSelectFolderModal = (): void => {
			const onClose = (): void => closeModal(modal.id);
			createModal(
				{
					id: modal.id,
					maxHeight: '90vh',
					size: 'medium',
					children: root && (
						<SelectFolderModal
							root={root}
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
