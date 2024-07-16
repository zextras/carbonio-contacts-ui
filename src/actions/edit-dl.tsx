/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS, EDIT_DL_BOARD_ID } from '../constants';
import { DistributionList } from '../model/distribution-list';
import { EditDLBoardContext } from '../views/board/edit-dl-board';

export type EditDLAction = UIAction<
	Pick<DistributionList, 'email' | 'displayName' | 'id'>,
	Pick<DistributionList, 'isOwner'>
>;

export const useActionEditDL = (): EditDLAction => {
	const [t] = useTranslation();

	const execute = useCallback<EditDLAction['execute']>((distributionList) => {
		if (distributionList !== undefined) {
			const boardId = `${EDIT_DL_BOARD_ID}-${distributionList.id}`;
			const board = getBoardById(boardId);
			if (board) {
				setCurrentBoard(board.id);
				reopenBoards();
			} else {
				addBoard<EditDLBoardContext>({
					context: { id: distributionList.id },
					icon: 'DistributionListOutline',
					title: distributionList.displayName || distributionList.email,
					id: boardId,
					boardViewId: EDIT_DL_BOARD_ID
				});
			}
		}
	}, []);

	const canExecute = useCallback<EditDLAction['canExecute']>((dl) => dl?.isOwner === true, []);

	return useMemo(
		() => ({
			id: ACTION_IDS.editDL,
			label: t('action.edit_distribution_list', 'Edit'),
			icon: 'Edit2Outline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
