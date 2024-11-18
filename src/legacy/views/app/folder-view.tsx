/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { DetailPanel } from './detail-panel';
import { FolderListPanel } from './folder-list-panel';

export const FolderView = (): React.JSX.Element => (
	<>
		<FolderListPanel />
		<DetailPanel />
	</>
);
