/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { useBoardHooks } from '@zextras/carbonio-shell-ui';

import EditView from './edit-view';
import { EditViewProps } from '../../types/views/edit-view';

const EditViewBoardWrapper: FC = () => {
	const boardUtilities = useBoardHooks();

	const onClose = useCallback(() => {
		boardUtilities.closeBoard();
	}, [boardUtilities]);

	const onTitleChanged = useCallback<NonNullable<EditViewProps['onTitleChanged']>>(
		(title: string) => {
			boardUtilities.updateBoard({ title });
		},
		[boardUtilities]
	);

	return <EditView panel={false} onClose={onClose} onTitleChanged={onTitleChanged} />;
};

export default EditViewBoardWrapper;
