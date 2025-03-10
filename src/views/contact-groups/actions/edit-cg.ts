/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { UIAction } from '../../../actions/types';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';

export type EditActionCG = UIAction<void, void>;

export const useActionEditCG = (contactGroup: ContactGroup): EditActionCG => {
	const [t] = useTranslation();

	const canExecute = useCallback<EditActionCG['canExecute']>(() => true, []);

	const editCG = useCallback<EditActionCG['execute']>(() => {
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
				boardViewId: EDIT_CONTACT_GROUP_BOARD_ID,
				title: contactGroup.title,
				context: { contactGroupId: contactGroup.id, folderId: contactGroup.parent }
			});
		}
	}, [contactGroup]);

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
