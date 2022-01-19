/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense } from 'react';
import {
	registerAppData,
	registerComponents,
	Spinner,
	getBridgedFunctions
} from '@zextras/carbonio-shell-ui';
import SidebarItems from './views/secondary-bar/sidebar';
import ContactInput from './shared/contact-input';
import { SyncDataHandler } from './views/secondary-bar/sync-data-handler';

const LazyAppView = lazy(() => import(/* webpackChunkName: "contacts-view" */ './views/app-view'));

const LazySettingsView = lazy(() =>
	import(/* webpackChunkName: "settings-view" */ './settings/settings-view')
);
const LazySearchView = lazy(() =>
	import(/* webpackChunkName: "edit-view" */ './views/search/search-view')
);
const LazyBoardView = lazy(() =>
	import(/* webpackChunkName: "board-view" */ './views/board/board-view')
);

const AppView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyAppView {...props} />
	</Suspense>
);

const BoardView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazyBoardView {...props} />
	</Suspense>
);

const SettingsView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazySettingsView {...props} />
	</Suspense>
);

const SearchView = (props) => (
	<Suspense fallback={<Spinner />}>
		<LazySearchView {...props} />
	</Suspense>
);

export default function App() {
	console.log(
		'%c CONTACTS APP LOADED',
		'color: white; background: #8bc34a;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%'
	);
	useEffect(() => {
		registerAppData({
			icon: 'ContactsModOutline',
			views: {
				app: AppView,
				settings: SettingsView,
				board: BoardView,
				sidebar: SidebarItems,
				search: SearchView
			},
			context: {},
			newButton: {
				primary: {
					id: 'create-contact',
					label: 'New Contact',
					icon: 'PersonOutline',
					click: () => {
						getBridgedFunctions().addBoard('/new');
					}
				},
				secondaryItems: []
			}
		});
	}, []);

	useEffect(() => {
		registerComponents({
			id: 'contact-input',
			component: ContactInput
		});
	}, []);
	// useEffect(() => {
	// 	store.setReducer(reducers);
	// }, []);

	return <SyncDataHandler />;
}
