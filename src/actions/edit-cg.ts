/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { DeleteCGAction } from './delete-cg';
import { UIAction } from './types';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID } from '../constants';
import { ContactGroup } from '../model/contact-group';

export type EditActionCG = UIAction<ContactGroup, never>;

export const useActionEditCG = (): EditActionCG => {
	const [t] = useTranslation();

	const canExecute = useCallback<DeleteCGAction['canExecute']>(() => true, []);

	const editCG = useCallback<EditActionCG['execute']>((contactGroup) => {
		if (contactGroup === undefined) {
			return;
		}
		const board = getBoardById(`${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroup.id}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroup.id}`,
				url: EDIT_CONTACT_GROUP_BOARD_ID,
				title: contactGroup.title,
				context: { contactGroupId: contactGroup.id }
			});
		}
	}, []);

	return useMemo(
		() => ({
			id: ACTION_IDS.editCG,
			label: t('action.edit', 'Edit'),
			icon: 'Edit2Outline',
			canExecute,
			execute: editCG
		}),
		[canExecute, editCG, t]
	);
};
