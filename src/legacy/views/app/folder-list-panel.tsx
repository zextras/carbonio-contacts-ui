/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Suspense } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { Route, Routes } from 'react-router-dom';

import { FolderPanelWrapper } from './folder-panel-wrapper';
import { Spinner } from '../../../components/Spinner';

export const FolderListPanel = (): React.JSX.Element => (
	<Routes>
		<Route
			path={'folder/:folderId/:type?/:itemId?'}
			element={
				<Container width="40%" borderColor={{ right: 'gray3' }}>
					<Suspense fallback={<Spinner />}>
						<FolderPanelWrapper />
					</Suspense>
				</Container>
			}
		/>
	</Routes>
);
