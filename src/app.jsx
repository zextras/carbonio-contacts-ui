/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { lazy, useEffect, Suspense } from 'react';
import {
	Spinner,
	addRoute,
	addSettingsView,
	addSearchView,
	addBoardView,
	registerActions,
	ACTION_TYPES,
	getBridgedFunctions,
	registerComponents
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import SidebarItems from './views/secondary-bar/sidebar';
import ContactInput from './shared/contact-input';
import { SyncDataHandler } from './views/secondary-bar/sync-data-handler';
import { CONTACTS_ROUTE, CONTACTS_APP_ID } from './constants';

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
	const [t] = useTranslation();
	useEffect(() => {
		// registerAppData({
		// 	icon: 'ContactsModOutline',
		// 	views: {
		// 		app: AppView,
		// 		settings: SettingsView,
		// 		board: BoardView,
		// 		sidebar: SidebarItems,
		// 		search: SearchView
		// 	},
		// 	context: {},
		// 	newButton: {
		// 		primary: {
		// 			id: 'create-contact',
		// 			label: 'New Contact',
		// 			icon: 'PersonOutline',
		// 			click: () => {
		// 				getBridgedFunctions().addBoard('/new');
		// 			}
		// 		},
		// 		secondaryItems: []
		// 	}
		// });
		addRoute({
			route: CONTACTS_ROUTE,
			position: 3,
			visible: true,
			label: t('label.app_name', 'Contacts'),
			primaryBar: 'ContactsModOutline',
			secondaryBar: SidebarItems,
			appView: AppView
		});
		addSettingsView({
			route: CONTACTS_ROUTE,
			label: t('label.app_name', 'Contacts'),
			component: SettingsView
		});
		addSearchView({
			route: CONTACTS_ROUTE,
			component: SearchView
		});
		addBoardView({
			route: CONTACTS_ROUTE,
			component: BoardView
		});
	}, [t]);

	useEffect(() => {
		registerComponents({
			id: 'contact-input',
			component: ContactInput
		});
		registerActions({
			action: () => ({
				id: 'new-contact',
				label: t('label.new_contact', 'New Contact'),
				icon: 'ContactsModOutline',
				click: (ev) => {
					ev?.preventDefault?.();
					getBridgedFunctions().addBoard(`${CONTACTS_ROUTE}/new`, {
						title: t('label.new_contact', 'New Contact')
					});
				},
				disabled: false,
				group: CONTACTS_APP_ID,
				primary: true
			}),
			id: 'new-contact',
			type: ACTION_TYPES.NEW
		});
	}, [t]);
	// useEffect(() => {
	// 	store.setReducer(reducers);
	// }, []);

	return <SyncDataHandler />;
}
