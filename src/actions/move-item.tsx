/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import {
	Container,
	Divider,
	ModalFooter,
	ModalHeader,
	Padding,
	useModal
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DeletableItem, UIAction } from './types';
import { ACTION_IDS } from '../constants';
import { CONTACT_GROUP_DELETE_ICON } from '../views/contact-groups/actions/constants';

type ModalProps = {
	modal: {
		id: string;
		title: string;
		confirmButtonLabel: string;
		folderSelector: React.JSX.Element;
	};
};
type MoveItem<T extends DeletableItem> = ModalProps & {
	onMoveConfirm: (item: T) => void;
};
type MoveActionBase<T extends DeletableItem> = UIAction<T, T>;
type MoveItemActionReturn = {
	deletedItemId: string;
};
type MoveConfirmProps<T extends DeletableItem> = ModalProps & {
	doMove: (item: T) => Promise<MoveItemActionReturn>;
};

function useCreateMoveModalAction<T extends DeletableItem>(): ({
	modal,
	doMove
}: MoveConfirmProps<T>) => MoveActionBase<T> {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const createMoveModal = (
		modalId: string,
		modalTitle: string,
		modalConfirmLabel: string,
		folderSelector: React.JSX.Element,
		item: T,
		doMove: (item: T) => Promise<MoveItemActionReturn>
	): void =>
		createModal({
			id: modalId,
			children: (
				<>
					<ModalHeader title={modalTitle} onClose={(): void => closeModal(modalId)} showCloseIcon />
					<Divider />
					<Padding vertical={'medium'}>
						<Container
							gap={'0.5rem'}
							mainAlignment={'flex-start'}
							crossAlignment={'flex-start'}
							height={'fit'}
						>
							{folderSelector}
						</Container>
					</Padding>
					<Divider />
					<ModalFooter
						confirmLabel={modalConfirmLabel}
						confirmDisabled={false}
						onConfirm={(): void => {
							doMove(item).then((response) => {
								closeModal(modalId);
								return response;
							});
						}}
					/>
				</>
			)
		});

	return ({ modal, doMove }): MoveActionBase<T> => {
		const execute = (item?: T): void => {
			if (!item) return;
			createMoveModal(
				modal.id,
				modal.title,
				modal.confirmButtonLabel,
				modal.folderSelector,
				item,
				doMove
			);
		};

		return {
			id: ACTION_IDS.move,
			label: t('label.move', 'Move'),
			icon: CONTACT_GROUP_DELETE_ICON,
			canExecute: () => true,
			execute
		};
	};
}

export const useMoveItemAction = <T extends DeletableItem>({
	modal,
	onMoveConfirm
}: MoveItem<T>): UIAction<T, T> => {
	const createMoveModal = useCreateMoveModalAction<T>();

	const doMove = useCallback(
		async (item: T) => {
			onMoveConfirm(item);
			return { deletedItemId: item.id };
		},
		[onMoveConfirm]
	);
	return createMoveModal({
		modal,
		doMove
	});
};
