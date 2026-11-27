/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useState } from 'react';

import { useBoardHooks } from '@zextras/carbonio-shell-ui';

import { useBoardContentStatus } from 'hooks/use-board-content-status';
import EditView from 'legacy/views/edit/edit-view';
import { EditViewProps } from 'legacy/types/views/edit-view';

const EditViewBoardWrapper: FC = () => {
	const boardUtilities = useBoardHooks();
	const [isDirty, setIsDirty] = useState(false);
	useBoardContentStatus(isDirty);

	const onClose = useCallback(() => {
		boardUtilities.closeBoard();
	}, [boardUtilities]);

	const onTitleChanged = useCallback<NonNullable<EditViewProps['onTitleChanged']>>(
		(title: string) => {
			boardUtilities.updateBoard({ title });
		},
		[boardUtilities]
	);

	return (
		<EditView
			panel={false}
			onClose={onClose}
			onTitleChanged={onTitleChanged}
			onDirtyChange={setIsDirty}
		/>
	);
};

export default EditViewBoardWrapper;
