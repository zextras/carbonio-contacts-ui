/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { Action } from '@zextras/carbonio-design-system';
import { addBoard, getBoardById, reopenBoards, setCurrentBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { getParentFolder } from '../../../actions/folder-utils';
import { ACTION_IDS, EDIT_CONTACT_GROUP_BOARD_ID } from '../../../constants';
import { ContactGroup } from '../../../model/contact-group';

export const useContactGroupEditAction = (contactGroup: ContactGroup): Action => {
	const [t] = useTranslation();

	const parentFolder = getParentFolder(contactGroup);

	const editCG = useCallback(() => {
		const board = getBoardById(`${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroup.id}`);
		if (board) {
			setCurrentBoard(board.id);
			reopenBoards();
		} else {
			addBoard({
				id: `${EDIT_CONTACT_GROUP_BOARD_ID}-${contactGroup.id}`,
				boardViewId: EDIT_CONTACT_GROUP_BOARD_ID,
				title: contactGroup.title,
				context: { contactGroupId: contactGroup.id, folderId: parentFolder?.id }
			});
		}
	}, [contactGroup.id, contactGroup.title, parentFolder?.id]);

	return useMemo(
		() => ({
			id: ACTION_IDS.editCG,
			label: t('action.edit', 'Edit'),
			icon: 'Edit2Outline',
			onClick: editCG
		}),
		[editCG, t]
	);
};
