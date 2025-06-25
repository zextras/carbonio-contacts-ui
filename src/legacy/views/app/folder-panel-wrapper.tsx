/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useFolder } from '@zextras/carbonio-ui-commons';
import { useParams } from 'react-router-dom';

import { FolderPanel } from 'legacy/views/app/folder-panel';
import { RouteParams } from 'constants/index';

export const FolderPanelWrapper = (): React.JSX.Element => {
	const { folderId } = useParams<RouteParams>() as { folderId: string };
	const folder = useFolder(folderId);
	if (!folder) return <></>;
	return <FolderPanel folder={folder} />;
};
