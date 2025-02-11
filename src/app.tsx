/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AuthGuard } from './app/auth-guard';
import { FoldersSynchronizator } from './app/folders-syncronization';
import { IntegrationsRegistration } from './app/integrations-registration';
import { ViewsRegistration } from './app/views-registration';
import { InitializeTags } from './components/initialize-tags';
import { StoreProvider } from './legacy/store/redux';
import { SyncDataHandler } from './legacy/views/secondary-bar/sync-data-handler';

const App = (): React.JSX.Element => (
	<AuthGuard>
		<FoldersSynchronizator />
		<InitializeTags />
		<ViewsRegistration />
		<IntegrationsRegistration />
		<StoreProvider>
			<SyncDataHandler />
		</StoreProvider>
	</AuthGuard>
);

export default App;
