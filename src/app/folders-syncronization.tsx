/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ModalManager } from '@zextras/carbonio-design-system';

import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { useInitializeFolders } from '../carbonio-ui-commons/hooks/use-initialize-folders';

const FoldersSynchronizatorLogic: React.FC = () => {
	useInitializeFolders(FOLDER_VIEW.contact);

	return null;
};

export const FoldersSynchronizator: React.FC = () => (
	<ModalManager>
		<FoldersSynchronizatorLogic />
	</ModalManager>
);
