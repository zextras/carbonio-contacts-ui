/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useParams } from 'react-router-dom';

import { FolderPanel } from './folder-panel';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { RouteParams } from '../../../constants';

export const FolderPanelWrapper = (): React.JSX.Element => {
	const { folderId } = useParams<RouteParams>() as { folderId: string };
	const folder = useFolder(folderId);
	if (folder) {
		return <FolderPanel folder={folder} />;
	}
	return <></>;
};
